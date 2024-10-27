import nodemailer from 'nodemailer';

export async function POST(req) {
    const { email, pluginData } = await req.json();

    // Create a transporter object using SMTP
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Your Gmail address
            pass: process.env.EMAIL_APP_PASSWORD, // Your Gmail app password
        },
    });

    // Hardcoded email template
    const emailTemplate = `
    <h1>New Plugin Submission</h1>
    <p>A new plugin has been submitted:</p>
    <h2>Plugin Details</h2>
    <ul>
      <li><strong>ID:</strong> ${pluginData.id}</li>
      <li><strong>Name:</strong> ${pluginData.name}</li>
      <li><strong>Author:</strong> ${pluginData.author}</li>
      <li><strong>Description:</strong> ${pluginData.description}</li>
      <li><strong>Image:</strong> ${pluginData.image}</li>
      <li><strong>Capabilities:</strong> ${pluginData.capabilities.join(', ')}</li>
    </ul>
    <p>Thank you!</p>
  `;

    // Set up email data
    const mailOptions = {
        from: '"Plugin Team" <no-reply@example.com>', // Sender address
        to: email, // List of recipients
        subject: 'New Plugin Submission', // Subject line
        html: emailTemplate, // HTML body content
    };

    // Send mail
    try {
        await transporter.sendMail(mailOptions);
        return new Response(JSON.stringify({ message: 'Email sent successfully!' }), { status: 200 });
    } catch (error) {
        console.error('Error sending email:', error);
        return new Response(JSON.stringify({ error: 'Failed to send email.' }), { status: 500 });
    }
}

