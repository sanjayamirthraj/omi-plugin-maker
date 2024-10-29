import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const formData = await req.formData();
        const pluginData = JSON.parse(formData.get('pluginData'));
        const pluginLogo = formData.get('pluginLogo');
        const pluginInstructions = formData.get('pluginInstructions');
        console.log("pluginInstructions", pluginInstructions);
        // Create a transporter object using SMTP
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD,
            },
        });

        // Create email content
        const emailTemplate = `
            <h1>New Plugin Submission</h1>
            
            <h2>Plugin Details</h2>
            <pre style="background-color: #f5f5f5; padding: 1rem; border-radius: 4px;">
                ${JSON.stringify(pluginData, null, 2)}
            </pre>

            <h2>Setup Instructions</h2>
            <pre style="background-color: #f5f5f5; padding: 1rem; border-radius: 4px;">
                ${pluginInstructions}
            </pre>

            ${pluginLogo ? '<p>Plugin logo is attached to this email.</p>' : ''}
            
            <p>Thank you for the submission!</p>
        `;

        // Handle attachments
        let attachments = [];
        if (pluginLogo) {
            const buffer = Buffer.from(await pluginLogo.arrayBuffer());
            attachments.push({
                filename: pluginLogo.name,
                content: buffer,
            });
        }

        // Set up email data
        const mailOptions = {
            from: '"Plugin Team" <sanjay.amirthraj@gmail.com>',
            to: 'sanjay.amirthraj@gmail.com',
            subject: `New Plugin Submission: ${pluginData.name}`,
            html: emailTemplate,
            attachments,
        };

        // Send mail
        await transporter.sendMail(mailOptions);
        return NextResponse.json({
            message: 'Plugin submitted successfully!',
            status: 'success'
        });
    } catch (error) {
        console.error('Error sending email:', error);
        return NextResponse.json(
            {
                error: 'Failed to send plugin submission.',
                details: error.message
            },
            { status: 500 }
        );
    }
}
