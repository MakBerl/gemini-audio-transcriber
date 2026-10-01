export const transcribeAudio = async (base64Audio: string, mimeType: string): Promise<string> => {
  try {
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64Audio,
        mimeType,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to transcribe audio.');
    }

    return data.text || 'The model did not return any text. The audio might be silent or unrecognizable.';
  } catch (error: any) {
    console.error('Transcription error:', error);
    throw new Error(error.message || 'Failed to transcribe audio. Please ensure the file is a valid audio format and try again.');
  }
};
