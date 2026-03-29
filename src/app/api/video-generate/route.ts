import { NextRequest, NextResponse } from 'next/server';

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const HF_IMAGE_MODEL = 'stabilityai/stable-diffusion-xl-base-1.0';
const HF_VIDEO_MODEL = 'stabilityai/stable-video-diffusion-img2vid-1';

// Validate API key exists
if (!HUGGINGFACE_API_KEY) {
  console.error('HUGGINGFACE_API_KEY environment variable is not set!');
}

interface VideoGenerationRequest {
  prompt: string;
  imageUrl?: string;
  height?: number;
  width?: number;
}

interface VideoGenerationResponse {
  success: boolean;
  videoUrl?: string;
  jobId?: string;
  status?: string;
  error?: string;
  isLoading?: boolean;
  estimatedWaitTime?: number;
}

// Store for job status
const jobStore = new Map<string, {
  status: 'pending' | 'loading' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  error?: string;
  createdAt: number;
  prompt?: string;
  inputImageUrl?: string;
}>();

// Helper function to call HuggingFace API with retry for model loading
async function callHuggingFace(
  modelUrl: string,
  body: any,
  maxRetries = 3
): Promise<{ success: boolean; data?: ArrayBuffer; error?: string; isModelLoading?: boolean }> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(modelUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.status === 503 || response.status === 202) {
        // Model is loading - wait and retry
        const errorBody = await response.json().catch(() => ({}));
        const estimatedTime = errorBody.estimated_time || 10;
        console.log(`Model loading, waiting ${estimatedTime}s... (attempt ${attempt + 1}/${maxRetries})`);

        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, (estimatedTime + 2) * 1000));
          continue;
        }

        return {
          success: false,
          error: `Model is loading. Estimated wait time: ${estimatedTime} seconds. Please try again in a moment.`,
          isModelLoading: true,
        };
      }

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: `API error ${response.status}: ${errorText}` };
      }

      const data = await response.arrayBuffer();
      return { success: true, data };

    } catch (error) {
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        continue;
      }
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  return { success: false, error: 'Max retries exceeded' };
}

// Helper function to call HF with multipart form data (for image input)
async function callHuggingFaceMultipart(
  modelUrl: string,
  imageData: ArrayBuffer,
  maxRetries = 3
): Promise<{ success: boolean; data?: ArrayBuffer; error?: string; isModelLoading?: boolean }> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const formData = new FormData();
      const blob = new Blob([imageData], { type: 'image/png' });
      formData.append('inputs', blob);

      const response = await fetch(modelUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
        },
        body: formData,
      });

      if (response.status === 503 || response.status === 202) {
        const errorBody = await response.json().catch(() => ({}));
        const estimatedTime = errorBody.estimated_time || 10;
        console.log(`Video model loading, waiting ${estimatedTime}s... (attempt ${attempt + 1}/${maxRetries})`);

        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, (estimatedTime + 2) * 1000));
          continue;
        }

        return {
          success: false,
          error: `Video model is loading. Estimated wait time: ${estimatedTime} seconds. Please try again.`,
          isModelLoading: true,
        };
      }

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: `API error ${response.status}: ${errorText}` };
      }

      const data = await response.arrayBuffer();
      return { success: true, data };

    } catch (error) {
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        continue;
      }
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  return { success: false, error: 'Max retries exceeded' };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Validate API key
    if (!HUGGINGFACE_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'HUGGINGFACE_API_KEY is not configured. Please set the environment variable.'
      }, { status: 500 });
    }

    const body: VideoGenerationRequest = await request.json();
    const { prompt, imageUrl, height = 1024, width = 1024 } = body;

    if (!prompt && !imageUrl) {
      return NextResponse.json({
        success: false,
        error: 'Either prompt or imageUrl is required'
      }, { status: 400 });
    }

    // Generate a job ID
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Store job as pending
    jobStore.set(jobId, {
      status: 'pending',
      createdAt: Date.now(),
      prompt,
      inputImageUrl: imageUrl,
    });

    console.log(`Starting video generation job: ${jobId}`);

    // Step 1: Generate or get input image
    let inputImageData: ArrayBuffer | null = null;

    if (imageUrl) {
      // Fetch provided image
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error('Failed to fetch provided image');
      }
      inputImageData = await imageResponse.arrayBuffer();
    } else if (prompt) {
      // Generate image from prompt
      jobStore.set(jobId, { status: 'loading', createdAt: Date.now(), prompt });

      const imageResult = await callHuggingFace(
        `https://api-inference.huggingface.co/models/${HF_IMAGE_MODEL}`,
        {
          inputs: prompt,
          parameters: { height, width }
        }
      );

      if (!imageResult.success) {
        jobStore.set(jobId, {
          status: 'failed',
          error: imageResult.error,
          createdAt: Date.now()
        });

        return NextResponse.json({
          success: false,
          jobId,
          error: imageResult.error,
          isLoading: imageResult.isModelLoading,
        }, { status: imageResult.isModelLoading ? 202 : 500 });
      }

      inputImageData = imageResult.data!;
      console.log('Input image generated successfully');
    }

    if (!inputImageData) {
      throw new Error('No input image available');
    }

    // Step 2: Generate video from image
    jobStore.set(jobId, { status: 'processing', createdAt: Date.now(), prompt, inputImageUrl: imageUrl });

    const videoResult = await callHuggingFaceMultipart(
      `https://api-inference.huggingface.co/models/${HF_VIDEO_MODEL}`,
      inputImageData
    );

    if (!videoResult.success) {
      jobStore.set(jobId, {
        status: 'failed',
        error: videoResult.error,
        createdAt: Date.now()
      });

      return NextResponse.json({
        success: false,
        jobId,
        error: videoResult.error,
        isLoading: videoResult.isModelLoading,
      }, { status: videoResult.isModelLoading ? 202 : 500 });
    }

    // Convert video to base64 for embedding in response
    const videoBuffer = videoResult.data!;
    const videoBase64 = Buffer.from(videoBuffer).toString('base64');
    const videoUrl = `data:video/mp4;base64,${videoBase64}`;

    jobStore.set(jobId, {
      status: 'completed',
      videoUrl,
      createdAt: Date.now()
    });

    console.log(`Video generation complete for job: ${jobId}`);

    return NextResponse.json({
      success: true,
      jobId,
      videoUrl,
      status: 'completed'
    });

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({
      success: false,
      error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 });
  }
}

// GET endpoint to check job status
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json({
      success: false,
      error: 'jobId is required'
    }, { status: 400 });
  }

  const job = jobStore.get(jobId);

  if (!job) {
    return NextResponse.json({
      success: false,
      error: 'Job not found'
    }, { status: 404 });
  }

  // Clean up old jobs (older than 1 hour)
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  if (job.createdAt < oneHourAgo) {
    jobStore.delete(jobId);
    return NextResponse.json({
      success: false,
      error: 'Job expired'
    }, { status: 410 });
  }

  return NextResponse.json({
    success: true,
    jobId,
    status: job.status,
    videoUrl: job.videoUrl,
    error: job.error
  });
}
