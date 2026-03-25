import axios from 'axios';

async function createOrUpdateTemplate() {
    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
        console.error('Error: BREVO_API_KEY is not set in the environment variables.');
        return;
    }

    // Replace with your specific template data
    const templateData = {
        name: 'Welcome Email',
        subject: 'Welcome to Our Service!',
        htmlContent: '<html><body><h1>Welcome!</h1><p>We are glad to have you with us.</p></body></html>',
    };

    try {
        // Create or update the template via Brevo API
        const response = await axios.post('https://api.brevo.com/v1/templates', templateData, {
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey,
            },
        });

        if (response.status === 200 || response.status === 201) {
            console.log('Template created/updated successfully:', response.data);
        } else {
            console.log('Failed to create/update template:', response.data);
        }
    } catch (error) {
        console.error('Error while making request to Brevo API:', error.message);
    }
}

createOrUpdateTemplate();