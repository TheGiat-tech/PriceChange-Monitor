import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export interface ChangeAlertEmailData {
  to: string
  url: string
  label?: string
  oldValue: string
  newValue: string
  timestamp: Date
}

export async function sendChangeAlert(data: ChangeAlertEmailData): Promise<boolean> {
  if (!resend) {
    console.error('Resend not configured - skipping email')
    return false
  }

  try {
    const displayName = data.label || data.url
    
    await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: data.to,
      subject: `PricePing alert: change detected - ${displayName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Change Detected</h2>
          <p>A change was detected on your monitored page:</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>URL:</strong> <a href="${data.url}" style="color: #0066cc;">${data.url}</a></p>
            ${data.label ? `<p><strong>Label:</strong> ${data.label}</p>` : ''}
            <p><strong>Time:</strong> ${data.timestamp.toLocaleString()}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #666; font-size: 14px; margin-bottom: 5px;">Previous Value:</h3>
            <p style="background: #ffe6e6; padding: 10px; border-radius: 5px;">${data.oldValue}</p>
            
            <h3 style="color: #666; font-size: 14px; margin-bottom: 5px; margin-top: 15px;">New Value:</h3>
            <p style="background: #e6ffe6; padding: 10px; border-radius: 5px;">${data.newValue}</p>
          </div>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            You received this email because you set up a monitor on PricePing.
          </p>
        </div>
      `,
    })
    
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}
