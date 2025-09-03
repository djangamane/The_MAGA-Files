import { Resend } from 'resend';
import { AnalysisResult } from '../types';

// Initialize Resend with your API key from environment variables
// Make sure to set VITE_RESEND_API_KEY in your .env file and Vercel environment
const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

export async function sendAnalysisEmail(
  userEmail: string,
  query: string,
  analysisResult: AnalysisResult
): Promise<{ success: boolean; error?: string }> {
  if (!userEmail) {
    return { success: false, error: 'User email is required to send analysis.' };
  }

  if (!import.meta.env.VITE_RESEND_API_KEY) {
    return { success: false, error: 'Resend API key is not configured. Email cannot be sent.' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'The MAGA Files <janga@planetarychess.com>',
      to: userEmail,
      subject: `Your MAGA Files Analysis for: "${query}"`,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your MAGA Files Analysis</title>
</head>
<body style="font-family: sans-serif; background-color: #0f172a; color: #cbd5e1; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background-color: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 20px;">
        <h1 style="color: #f9a8d4; text-align: center;">The MAGA Files Analysis</h1>
        <p style="font-size: 1.1em;">Here is the analysis you requested for: <strong>"${query}"</strong></p>
        <hr style="border-color: #334155;">

        <h2 style="color: #7dd3fc;">Overall Summary</h2>
        <p>${analysisResult.overallSummary}</p>

        <h2 style="color: #7dd3fc;">Key Themes</h2>
        <ul style="list-style-type: disc; padding-left: 20px;">
            ${analysisResult.keyThemes.map(theme => `<li style="margin-bottom: 5px;">${theme}</li>`).join('')}
        </ul>

        <h2 style="color: #7dd3fc;">Emerging Trends</h2>
        ${analysisResult.emergingTrends.map(trend => `
            <div style="margin-bottom: 15px; padding-left: 10px; border-left: 3px solid #f9a8d4;">
                <h3 style="margin-bottom: 5px; color: #f9a8d4;">${trend.trend}</h3>
                <p style="margin-top: 0;">${trend.description}</p>
                <p><strong>Supporting Data:</strong></p>
                <ul style="font-style: italic; color: #94a3b8;">
                    ${trend.supportingData.map(data => `<li>"${data}"</li>`).join('')}
                </ul>
            </div>
        `).join('')}

        <h2 style="color: #7dd3fc;">Notable Quotes</h2>
        <ul style="list-style-type: none; padding-left: 0;">
            ${analysisResult.notableQuotes.map(quote => `<li style="padding: 10px; border-left: 3px solid #7dd3fc; margin-bottom: 10px; background-color: #334155;">"${quote.quote}" - <em>${quote.context}</em></li>`).join('')}
        </ul>

        <h2 style="color: #7dd3fc;">Data Connections</h2>
        <p>${analysisResult.dataConnections}</p>

        <hr style="border-color: #334155;">
        <p style="text-align: center; color: #94a3b8;">Thank you for using The MAGA Files!</p>
        <p style="text-align: center; font-size: 0.8em; color: #64748b;">The MAGA Files Team</p>
    </div>
</body>
</html>`,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }

    console.log('Email sent successfully:', data);
    return { success: true };
  } catch (err) {
    console.error('Unexpected error during email sending:', err);
    return { success: false, error: 'An unexpected error occurred while sending the email.' };
  }
}