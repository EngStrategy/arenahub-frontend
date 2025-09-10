export const handleStripeWebhook = async (payload: string, signature: string) => {
    
    const backendWebhookUrl = 'http://localhost:8080/api/v1/stripe/webhook';
    
    const response = await fetch(backendWebhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
            'Stripe-Signature': signature,
        },
        body: payload,
    });

    if (!response.ok) {
        throw new Error(`Backend respondeu com status: ${response.status}`);
    }
    
    return await response.json();
};