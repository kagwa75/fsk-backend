// routes/mpesa.js
import dotenv from 'dotenv';
import express from 'express';
import axios from 'axios';
import base64 from 'base-64';

dotenv.config();

const router = express.Router();


router.post('/stkpush', async (req, res) => {
  try {
    const { phone, amount } = req.body;
    
    // Validate inputs
    if (!phone || !amount) {
      return res.status(400).json({ error: 'Phone and amount are required' });
    }

    // Get access token
    const tokenResponse = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${base64.encode(`${process.env.CONSUMER_KEY}:${process.env.CONSUMER_SECRET}`)}`,
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;
    console.log("Access Token:", accessToken); // Verify token is correct
    
    // Generate timestamp and password
      const now = new Date();
    const timestamp = 
      now.getFullYear() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0');
    const password = base64.encode(`${process.env.BUSINESS_SHORT_CODE}${process.env.PASSKEY}${timestamp}`);
    
    // Format phone number
    let formattedPhone = phone.startsWith('0') ? `254${phone.substring(1)}` : phone;
    formattedPhone = formattedPhone.replace(/\+/g, '');

    // Prepare STK Push request
    const requestBody = {
      BusinessShortCode: process.env.BUSINESS_SHORT_CODE,
      Password: process.env.Password,
      Timestamp: "20160216165627",
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: formattedPhone,
      PartyB: process.env.BUSINESS_SHORT_CODE,
      PhoneNumber: formattedPhone,
      CallBackURL: process.env.CALLBACK_URL,
      AccountReference: 'Donation',
      TransactionDesc: 'Charity donation'
    };

    console.log("STK Push Request Body:", requestBody); // Log the full request

    const stkResponse = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(stkResponse.data);
    
  } catch (error) {
    console.error('Full STK Push Error:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });
    
    res.status(500).json({ 
      error: 'Failed to initiate payment',
      details: error.response?.data || error.message
    });
  }
});
router.post('/qr', async (req, res) => {
  try {
    // First get access token
    const tokenResponse = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${base64.encode(`${process.env.CONSUMER_KEY}:${process.env.CONSUMER_SECRET}`)}`,
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // QR code request parameters
    const qrRequest = {
      MerchantName: "James Hub",
      RefNo: "INV001", // Unique reference number
      Amount: 1, // Amount in KES
      TrxCode: "BG", // BG for Buy Goods, PB for Pay Bill
      CPI: "373132", // Credential Payment Identifier (Get from Safaricom)
      Size: "300" // QR code size in pixels (300 or 500)
    };

    // Make QR code generation request
    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/qrcode/v1/generate',
      qrRequest,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Return the QR code data (base64 image)
    res.json({
      success: true,
      qrCode: response.data.QRCode,
      metadata: response.data
    });

  } catch (error) {
    console.error('QR Code Generation Error:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate QR code',
      details: error.response?.data || error.message
    });
  }
});
//bill manager
router.post('bill',async (req,res) => {
try {
  const token = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',{
    headers: {
      Authorization: `Basic ${base64.encode(`${process.env.CONSUMER_KEY}:${process.env.CONSUMER_SECRET}`)}`
    }
  });
  const accessToken = token.data.access_token;

  const billRequest = await axios.post('https://sandbox.safaricom.co.ke/v1/billmanager-invoice/optin',{
shortcode:"718003",
  email:"jimmymn782@gmail.com",
  officialContact:"0746221954",
  sendReminders:"1",
  logo:"image",
  callbackurl:"http://my.server.com/bar/callback"

  },
{
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
})
console.log("bill:",billRequest.data);
res.json({bill: billRequest.data});
} catch (error) {
  console.error('QR Code Generation Error:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });
}
})

export default router; 