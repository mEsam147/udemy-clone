// utils/certificateGenerator.js - Using Puppeteer (no Python/C++ needed)
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

class CertificateGenerator {
  static async generateCertificate(certificateData, outputPath) {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      const page = await browser.newPage();

      // Set viewport
      await page.setViewport({ width: 794, height: 1123 }); // A4 size in pixels (72 DPI)

      // Load HTML template
      const htmlTemplate = this.generateHTMLTemplate(certificateData);
      await page.setContent(htmlTemplate, { waitUntil: "networkidle0" });

      // Generate PDF
      await page.pdf({
        path: outputPath,
        format: "A4",
        printBackground: true,
        margin: {
          top: "36px",
          right: "36px",
          bottom: "36px",
          left: "36px",
        },
      });

      console.log(`Certificate generated: ${outputPath}`);
      return outputPath;
    } catch (error) {
      console.error("Error generating certificate:", error);
      throw error;
    } finally {
      await browser.close();
    }
  }

  static generateHTMLTemplate(data) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Certificate of Completion</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Roboto', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }
        
        .certificate {
          background: white;
          width: 100%;
          max-width: 794px;
          min-height: 1123px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          padding: 60px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 40px;
          position: relative;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 80%;
          height: 2px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 2px;
        }
        
        .title {
          font-size: 36px;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        
        .subtitle {
          font-size: 14px;
          color: #7f8c8d;
          font-weight: 300;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        
        .content {
          text-align: center;
          margin: 60px 0;
        }
        
        .student-name {
          font-size: 28px;
          font-weight: 700;
          color: #e74c3c;
          margin: 20px 0;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        
        .course-title {
          font-size: 20px;
          font-weight: 600;
          color: #2c3e50;
          margin: 30px 0 20px 0;
          line-height: 1.4;
        }
        
        .details {
          display: flex;
          justify-content: center;
          gap: 40px;
          margin: 30px 0;
          font-size: 12px;
          color: #7f8c8d;
        }
        
        .detail-item {
          text-align: center;
        }
        
        .detail-label {
          font-weight: 600;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .detail-value {
          font-weight: 300;
        }
        
        .certificate-id {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 6px;
          padding: 8px 12px;
          font-family: 'Courier New', monospace;
          font-size: 11px;
          letter-spacing: 1px;
          color: #495057;
          margin: 20px auto;
          max-width: 300px;
          word-break: break-all;
        }
        
        .signatures {
          display: flex;
          justify-content: space-between;
          margin-top: 80px;
          font-size: 12px;
          color: #2c3e50;
        }
        
        .signature {
          text-align: center;
          flex: 1;
        }
        
        .signature-line {
          height: 1px;
          background: #2c3e50;
          margin: 20px 0 8px 0;
        }
        
        .verification {
          position: absolute;
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          font-size: 10px;
          color: #95a5a6;
          background: rgba(255,255,255,0.9);
          padding: 8px 16px;
          border-radius: 20px;
          border: 1px solid #dee2e6;
        }
        
        .qr-placeholder {
          width: 60px;
          height: 60px;
          border: 2px dashed #95a5a6;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: #95a5a6;
          margin-top: 10px;
        }
        
        @media print {
          body { background: white !important; }
          .certificate { box-shadow: none !important; }
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="header">
          <div class="title">Certificate of Completion</div>
          <div class="subtitle">${data.platform || "Learning Platform"}</div>
        </div>
        
        <div class="content">
          <p style="font-size: 16px; color: #2c3e50; margin-bottom: 20px;">
            This certifies that
          </p>
          
          <div class="student-name">${data.student.name}</div>
          
          <p style="font-size: 16px; color: #2c3e50; margin: 30px 0 10px 0;">
            has successfully completed
          </p>
          
          <div class="course-title">${data.course.title}</div>
          
          <div class="details">
            <div class="detail-item">
              <div class="detail-label">Duration</div>
              <div class="detail-value">${
                data.course.totalHours || 0
              } hours</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Level</div>
              <div class="detail-value">${
                data.course.level || "All Levels"
              }</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Category</div>
              <div class="detail-value">${
                data.course.category || "Professional Development"
              }</div>
            </div>
          </div>
          
          <div class="certificate-id">
            Certificate ID: ${data.certificateId}
          </div>
          
          <div style="margin-top: 40px; font-size: 14px; color: #2c3e50;">
            <div class="detail-label" style="margin-bottom: 8px;">Date of Completion</div>
            <div class="detail-value" style="font-size: 16px; font-weight: 600;">
              ${data.completionDate}
            </div>
          </div>
        </div>
        
        <div class="signatures">
          <div class="signature">
            <div class="signature-line"></div>
            <div style="margin-top: 8px;">${data.course.instructor}</div>
            <div style="font-size: 10px; color: #7f8c8d; margin-top: 4px;">Instructor</div>
          </div>
          
          <div class="signature">
            <div class="signature-line"></div>
            <div style="margin-top: 8px;">Learning Platform Administrator</div>
            <div style="font-size: 10px; color: #7f8c8d; margin-top: 4px;">Administrator</div>
          </div>
        </div>
        
        <div class="verification">
          <div style="margin-bottom: 4px;">Verify this certificate:</div>
          <div style="font-size: 9px; margin-bottom: 4px;">
            miniudemy.com/verify-certificate/${data.certificateId}
          </div>
          <div class="qr-placeholder">
            QR Code
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
  }
}

module.exports = CertificateGenerator;
