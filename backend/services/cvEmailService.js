require("dotenv").config();
const nodemailer = require("nodemailer");

// Create reusable transporter with error handling
const createTransporter = () => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error(
        "Email credentials are not properly configured in environment variables"
      );
    }

    return nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Add timeout and retry options
      pool: true, // Use pooled connections
      maxConnections: 5,
      maxMessages: 100,
      rateDelta: 1000,
      rateLimit: 5, // Limit to 5 emails per second
    });
  } catch (error) {
    console.error("Error creating email transporter:", error);
    throw error;
  }
};

const sendSuccessEmail = async (internName, emailAddress, referenceNumber) => {
  if (!internName || !emailAddress || !referenceNumber) {
    throw new Error("Missing required parameters for sending email");
  }

  let transporter;
  try {
    transporter = createTransporter();

    // Verify transporter connection
    await transporter.verify();

    const mailOptions = {
      from: {
        name: "Mobitel Intern Management System",
        address: process.env.EMAIL_USER,
      },
      to: emailAddress,
      subject: "CV Successfully Submitted - Mobitel Intern Management System",
      html: `
        <p>Dear ${internName},</p>
        <p>Thank you for submitting your CV to the Sri Lanka Telecom Mobitel Intern Management System. We confirm that your CV has been successfully received and uploaded to our system.</p>
        <p><strong>Submission Details:</strong></p>
        <ul>
          <li>Submission Date: ${new Date().toLocaleDateString()}</li>
          <li>Submission Time: ${new Date().toLocaleTimeString()}</li>
          <li>Reference Number: ${referenceNumber}</li>
        </ul>
        <p><strong>What Happens Next:</strong></p>
        <ol>
          <li>Our HR team will review your CV within 5-7 working days</li>
          <li>You will receive an email notification about the status of your application</li>
          <li>If shortlisted, you will be contacted for the next steps in the selection process</li>
        </ol>
        <p><strong>Important Notes:</strong></p>
        <ul>
          <li>Please ensure all information provided in your CV is accurate and up-to-date</li>
          <li>You can update your CV at any time by logging into your account</li>
          <li>Keep your reference number for future correspondence</li>
        </ul>
        <p>If you need to make any changes to your submission or have any questions, please log in to your account or contact our HR support team.</p>
        <p>Best regards,<br>HR Department<br>Sri Lanka Telecom Mobitel</p>
        <p>---<br>This is an automated message. Please do not reply directly to this email.</p>
      `,
      // Add text version for better deliverability
      text: `
        Dear ${internName},

        Thank you for submitting your CV to the Sri Lanka Telecom Mobitel Intern Management System. We confirm that your CV has been successfully received and uploaded to our system.

        Submission Details:
        - Submission Date: ${new Date().toLocaleDateString()}
        - Submission Time: ${new Date().toLocaleTimeString()}
        - Reference Number: ${referenceNumber}

        What Happens Next:
        1. Our HR team will review your CV within 5-7 working days
        2. You will receive an email notification about the status of your application
        3. If shortlisted, you will be contacted for the next steps in the selection process

        Best regards,
        HR Department
        Sri Lanka Telecom Mobitel
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Success email sent:", {
      messageId: info.messageId,
      recipient: emailAddress,
      timestamp: new Date().toISOString(),
    });

    return info;
  } catch (error) {
    console.error("Error sending email:", {
      error: error.message,
      recipient: emailAddress,
      timestamp: new Date().toISOString(),
    });
    throw error;
  } finally {
    if (transporter) {
      transporter.close();
    }
  }
};

const sendAdminCreatedEmail = async (
  internName,
  emailAddress,
  referenceNumber,
  { username, password, status }
) => {
  if (
    !internName ||
    !emailAddress ||
    !referenceNumber ||
    !username ||
    !password
  ) {
    throw new Error(
      "Missing required parameters for sending admin created email"
    );
  }

  let transporter;
  try {
    transporter = createTransporter();

    // Verify transporter connection
    await transporter.verify();

    const statusText = status === "cv-approved" ? "Approved" : "Pending Review";
    const loginUrl = process.env.FRONTEND_URL || "https://intern.mobitel.lk";

    const mailOptions = {
      from: {
        name: "Mobitel Intern Management System",
        address: process.env.EMAIL_USER,
      },
      to: emailAddress,
      subject:
        "Your Internship Account Has Been Created - Mobitel Intern Management System",
      html: `
        <p>Dear ${internName},</p>
        
        <p>Welcome to the Sri Lanka Telecom Mobitel Intern Management System! Your account has been successfully created by our HR team.</p>
        
        <p><strong>Your Account Credentials:</strong></p>
        <ul>
          <li>Username: <strong>${username}</strong></li>
          <li>Password: <strong>${password}</strong></li>
        </ul>
        
        <p><strong>Application Details:</strong></p>
        <ul>
          <li>Reference Number: ${referenceNumber}</li>
          <li>Status: ${statusText}</li>
          <li>Account Created: ${new Date().toLocaleDateString()}</li>
        </ul>
        
        <p><strong>Next Steps:</strong></p>
        <ol>
          <li>Log in to the system at: <a href="${loginUrl}">${loginUrl}</a></li>
          <li>Change your password immediately after first login</li>
          <li>${
            status === "cv-approved"
              ? "Your CV has been approved - no further action needed"
              : "Your CV is pending review by the HR team"
          }</li>
        </ol>
        
        <p><strong>Important Security Notes:</strong></p>
        <ul>
          <li>This is a system-generated password - please change it after your first login</li>
          <li>Never share your login credentials with anyone</li>
          <li>Mobitel staff will never ask for your password</li>
        </ul>
        
        <p>If you have any questions or need assistance, please contact our HR support team.</p>
        
        <p>Best regards,<br>HR Department<br>Sri Lanka Telecom Mobitel</p>
        <p>---<br>This is an automated message. Please do not reply directly to this email.</p>
      `,
      text: `
        Dear ${internName},

        Welcome to the Sri Lanka Telecom Mobitel Intern Management System! Your account has been successfully created by our HR team.

        Your Account Credentials:
        - Username: ${username}
        - Password: ${password}

        Application Details:
        - Reference Number: ${referenceNumber}
        - Status: ${statusText}
        - Account Created: ${new Date().toLocaleDateString()}

        Next Steps:
        1. Log in to the system at: ${loginUrl}
        2. Change your password immediately after first login
        3. ${
          status === "cv-approved"
            ? "Your CV has been approved - no further action needed"
            : "Your CV is pending review by the HR team"
        }

        Important Security Notes:
        - This is a system-generated password - please change it after your first login
        - Never share your login credentials with anyone
        - Mobitel staff will never ask for your password

        If you have any questions or need assistance, please contact our HR support team.

        Best regards,
        HR Department
        Sri Lanka Telecom Mobitel
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Admin created email sent:", {
      messageId: info.messageId,
      recipient: emailAddress,
      timestamp: new Date().toISOString(),
    });

    return info;
  } catch (error) {
    console.error("Error sending admin created email:", {
      error: error.message,
      recipient: emailAddress,
      timestamp: new Date().toISOString(),
    });
    throw error;
  } finally {
    if (transporter) {
      transporter.close();
    }
  }
};

// Send approval email
const sendApproveEmail = async (internName, emailAddress, referenceNumber) => {
  if (!internName || !emailAddress || !referenceNumber) {
    throw new Error("Missing required parameters for sending approval email");
  }

  let transporter;
  try {
    transporter = createTransporter();
    await transporter.verify();

    const mailOptions = {
      from: {
        name: "Mobitel Intern Management System",
        address: process.env.EMAIL_USER,
      },
      to: emailAddress,
      subject: "CV Approved - Mobitel Intern Management System",
      html: `
        <p>Dear ${internName},</p>
        <p>We are pleased to inform you that your CV has been reviewed and <strong>approved</strong> by our HR team at Sri Lanka Telecom Mobitel.</p>
        <p><strong>Application Details:</strong></p>
        <ul>
          <li>Reference Number: ${referenceNumber}</li>
          <li>Application Status: <span style="color: green; font-weight: bold;">APPROVED</span></li>
          <li>Review Date: ${new Date().toLocaleDateString()}</li>
        </ul>
        <p><strong>What Happens Next:</strong></p>
        <ol>
          <li>Your profile has been added to our Intern Database</li>
          <li>Based on departmental needs, you may be contacted for further steps</li>
          <li>Your application will remain active in our system for 6 months</li>
        </ol>
        <p><strong>Important Notes:</strong></p>
        <ul>
          <li>If your contact information changes, please update your profile through our portal</li>
          <li>You can view your current application status by logging into your account</li>
          <li>For any queries, please contact our HR support team at hr.interns@mobitel.lk</li>
        </ul>
        <p>Thank you for your interest in joining Sri Lanka Telecom Mobitel as an intern. We appreciate your patience throughout our selection process.</p>
        <p>Best regards,<br>HR Department<br>Sri Lanka Telecom Mobitel</p>
        <p>---<br>This is an automated message. Please do not reply directly to this email.</p>
      `,
      text: `
        Dear ${internName},

        We are pleased to inform you that your CV has been reviewed and APPROVED by our HR team at Sri Lanka Telecom Mobitel.

        Application Details:
        - Reference Number: ${referenceNumber}
        - Application Status: APPROVED
        - Review Date: ${new Date().toLocaleDateString()}

        What Happens Next:
        1. Your profile has been added to our Intern Database
        2. Based on departmental needs, you may be contacted for further steps
        3. Your application will remain active in our system for 6 months

        Important Notes:
        - If your contact information changes, please update your profile through our portal
        - You can view your current application status by logging into your account
        - For any queries, please contact our HR support team at hr.interns@mobitel.lk

        Thank you for your interest in joining Sri Lanka Telecom Mobitel as an intern. We appreciate your patience throughout our selection process.

        Best regards,
        HR Department
        Sri Lanka Telecom Mobitel
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Approval email sent:", {
      messageId: info.messageId,
      recipient: emailAddress,
      timestamp: new Date().toISOString(),
    });

    return info;
  } catch (error) {
    console.error("Error sending approval email:", {
      error: error.message,
      recipient: emailAddress,
      timestamp: new Date().toISOString(),
    });
    throw error;
  } finally {
    if (transporter) {
      transporter.close();
    }
  }
};

// Send decline email
const sendDeclineEmail = async (internName, emailAddress, referenceNumber) => {
  if (!internName || !emailAddress || !referenceNumber) {
    throw new Error("Missing required parameters for sending decline email");
  }

  let transporter;
  try {
    transporter = createTransporter();
    await transporter.verify();

    const mailOptions = {
      from: {
        name: "Mobitel Intern Management System",
        address: process.env.EMAIL_USER,
      },
      to: emailAddress,
      subject: "Application Status Update - Mobitel Intern Management System",
      html: `
        <p>Dear ${internName},</p>
        <p>Thank you for your interest in the internship opportunity at Sri Lanka Telecom Mobitel and for taking the time to submit your CV.</p>
        <p><strong>Application Details:</strong></p>
        <ul>
          <li>Reference Number: ${referenceNumber}</li>
          <li>Application Status: <span style="color: #d14836; font-weight: bold;">NOT SELECTED</span></li>
          <li>Review Date: ${new Date().toLocaleDateString()}</li>
        </ul>
        <p>After careful consideration of your application, we regret to inform you that we are unable to proceed with your candidacy at this time. This decision does not necessarily reflect on your qualifications or abilities, but rather is the result of the competitive nature of our selection process and specific requirements for our current internship positions.</p>
        <p><strong>Next Steps:</strong></p>
        <ul>
          <li>Your information will be kept in our database for 6 months</li>
          <li>You are welcome to apply for future internship opportunities</li>
          <li>We encourage you to continue developing your skills and experience</li>
        </ul>
        <p><strong>Additional Information:</strong></p>
        <ul>
          <li>You can check our careers page for future opportunities: <a href="https://careers.mobitel.lk">careers.mobitel.lk</a></li>
          <li>Follow our social media channels for announcements about upcoming internship programs</li>
          <li>If you have any questions, please contact our HR support team at hr.interns@mobitel.lk</li>
        </ul>
        <p>We appreciate your understanding and wish you success in your future endeavors.</p>
        <p>Best regards,<br>HR Department<br>Sri Lanka Telecom Mobitel</p>
        <p>---<br>This is an automated message. Please do not reply directly to this email.</p>
      `,
      text: `
        Dear ${internName},

        Thank you for your interest in the internship opportunity at Sri Lanka Telecom Mobitel and for taking the time to submit your CV.

        Application Details:
        - Reference Number: ${referenceNumber}
        - Application Status: NOT SELECTED
        - Review Date: ${new Date().toLocaleDateString()}

        After careful consideration of your application, we regret to inform you that we are unable to proceed with your candidacy at this time. This decision does not necessarily reflect on your qualifications or abilities, but rather is the result of the competitive nature of our selection process and specific requirements for our current internship positions.

        Next Steps:
        - Your information will be kept in our database for 6 months
        - You are welcome to apply for future internship opportunities
        - We encourage you to continue developing your skills and experience

        Additional Information:
        - You can check our careers page for future opportunities: careers.mobitel.lk
        - Follow our social media channels for announcements about upcoming internship programs
        - If you have any questions, please contact our HR support team at hr.interns@mobitel.lk

        We appreciate your understanding and wish you success in your future endeavors.

        Best regards,
        HR Department
        Sri Lanka Telecom Mobitel
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Decline email sent:", {
      messageId: info.messageId,
      recipient: emailAddress,
      timestamp: new Date().toISOString(),
    });

    return info;
  } catch (error) {
    console.error("Error sending decline email:", {
      error: error.message,
      recipient: emailAddress,
      timestamp: new Date().toISOString(),
    });
    throw error;
  } finally {
    if (transporter) {
      transporter.close();
    }
  }
};

const sendInterviewScheduleEmail = async (
  internName,
  emailAddress,
  referenceNumber,
  interviewName,
  interviewDate
) => {
  if (
    !internName ||
    !emailAddress ||
    !referenceNumber ||
    !interviewName ||
    !interviewDate
  ) {
    throw new Error(
      "Missing required parameters for sending interview schedule email"
    );
  }

  let transporter;
  try {
    transporter = createTransporter();
    await transporter.verify();

    // Format interview date nicely if it's a valid date
    let formattedDate = interviewDate;
    try {
      const dateObj = new Date(interviewDate);
      if (!isNaN(dateObj.getTime())) {
        formattedDate = dateObj.toLocaleString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    } catch (e) {
      console.log("Date formatting error, using original string:", e);
    }

    const mailOptions = {
      from: {
        name: "Mobitel Intern Management System",
        address: process.env.EMAIL_USER,
      },
      to: emailAddress,
      subject: "Interview Scheduled - Mobitel Intern Management System",
      html: `
        <p>Dear ${internName},</p>
        <p>We are pleased to inform you that you have been shortlisted for an interview for the internship position at Sri Lanka Telecom Mobitel.</p>
        <p><strong>Interview Details:</strong></p>
        <ul>
          <li>Reference Number: ${referenceNumber}</li>
          <li>Interview: <strong>${interviewName}</strong></li>
          <li>Date and Time: <strong>${formattedDate}</strong></li>
          <li>Location: Sri Lanka Telecom Mobitel Head Office, Colombo</li>
        </ul>
        <p><strong>What to Bring:</strong></p>
        <ol>
          <li>National Identity Card or valid photo identification</li>
          <li>A printed copy of your CV</li>
          <li>Original educational certificates for verification</li>
          <li>Any portfolio or work samples (if applicable)</li>
        </ol>
        <p><strong>Important Notes:</strong></p>
        <ul>
          <li>Please arrive 15 minutes before your scheduled interview time</li>
          <li>Dress professionally for the interview</li>
          <li>Be prepared to discuss your educational background, skills, and career goals</li>
          <li>The interview will last approximately 45-60 minutes</li>
        </ul>
        <p>If you need to reschedule your interview or have any questions, please contact our HR team at hr.interns@mobitel.lk at least 24 hours before your scheduled interview time.</p>
        <p>We look forward to meeting you!</p>
        <p>Best regards,<br>HR Department<br>Sri Lanka Telecom Mobitel</p>
        <p>---<br>This is an automated message. Please do not reply directly to this email.</p>
      `,
      text: `
        Dear ${internName},

        We are pleased to inform you that you have been shortlisted for an interview for the internship position at Sri Lanka Telecom Mobitel.

        Interview Details:
        - Reference Number: ${referenceNumber}
        - Interview: ${interviewName}
        - Date and Time: ${formattedDate}
        - Location: Sri Lanka Telecom Mobitel Head Office, Colombo

        What to Bring:
        1. National Identity Card or valid photo identification
        2. A printed copy of your CV
        3. Original educational certificates for verification
        4. Any portfolio or work samples (if applicable)

        Important Notes:
        - Please arrive 15 minutes before your scheduled interview time
        - Dress professionally for the interview
        - Be prepared to discuss your educational background, skills, and career goals
        - The interview will last approximately 45-60 minutes

        If you need to reschedule your interview or have any questions, please contact our HR team at hr.interns@mobitel.lk at least 24 hours before your scheduled interview time.

        We look forward to meeting you!

        Best regards,
        HR Department
        Sri Lanka Telecom Mobitel
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Interview schedule email sent:", {
      messageId: info.messageId,
      recipient: emailAddress,
      timestamp: new Date().toISOString(),
    });

    return info;
  } catch (error) {
    console.error("Error sending interview schedule email:", {
      error: error.message,
      recipient: emailAddress,
      timestamp: new Date().toISOString(),
    });
    throw error;
  } finally {
    if (transporter) {
      transporter.close();
    }
  }
};

const sendInductionAssignmentEmail = async ({
  recipientName = "Intern",
  recipientEmail,
  refNo = "N/A",
  inductionName,
  startDate,
  endDate,
  location = "Sri Lanka Telecom Mobitel Training Center, Colombo",
}) => {
  // Validate required fields
  if (!recipientEmail) throw new Error("Recipient email is required");
  if (!inductionName) throw new Error("Induction name is required");
  if (!startDate) throw new Error("Start date is required");
  if (!endDate) throw new Error("End date is required");

  let transporter;
  try {
    transporter = createTransporter();
    await transporter.verify();

    const formatDate = (dateString) => {
      try {
        const date = new Date(dateString);
        return isNaN(date.getTime())
          ? dateString
          : date.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });
      } catch (e) {
        console.error("Date formatting error:", e);
        return dateString;
      }
    };

    const mailOptions = {
      from: {
        name: "Mobitel Intern Management System",
        address: process.env.EMAIL_USER,
      },
      to: recipientEmail,
      subject: `Induction Assignment - ${inductionName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Dear ${recipientName},</p>
          
          <p>You have been assigned to the following induction program:</p>
          
          <h3>Program Details</h3>
          <ul>
            <li><strong>Reference No:</strong> ${refNo}</li>
            <li><strong>Program:</strong> ${inductionName}</li>
            <li><strong>Dates:</strong> ${formatDate(
              startDate
            )} to ${formatDate(endDate)}</li>
            <li><strong>Location:</strong> ${location}</li>
          </ul>
          
          <p>Best regards,<br>HR Department</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent to:", recipientEmail);
    return info;
  } catch (error) {
    console.error("Email sending failed:", {
      recipient: recipientEmail,
      error: error.message,
    });
    throw error;
  } finally {
    if (transporter) {
      transporter.close();
    }
  }
};

module.exports = {
  sendSuccessEmail,
  sendAdminCreatedEmail,
  sendDeclineEmail,
  sendApproveEmail,
  sendInductionAssignmentEmail,
  sendInterviewScheduleEmail,
};
/*const sendInductionAssignmentEmail = async ({
  recipientName,
  recipientEmail,
  refNo,
  inductionName,
  startDate,
  endDate,
  location = "Sri Lanka Telecom Mobitel Training Center, Colombo",
  requirements = "National ID, Notebook & Pen, Signed Agreement Form, Passport Photos",
}) => {
  // Validate required parameters
  const requiredParams = {
    recipientName,
    recipientEmail,
    refNo,
    inductionName,
    startDate,
    endDate,
  };
  const missingParams = Object.entries(requiredParams)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingParams.length > 0) {
    throw new Error(`Missing required parameters: ${missingParams.join(", ")}`);
  }

  let transporter;
  try {
    transporter = createTransporter();
    await transporter.verify();

    // Format dates
    const formatDate = (dateString) => {
      try {
        const date = new Date(dateString);
        return isNaN(date.getTime())
          ? dateString
          : date.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });
      } catch (e) {
        console.error("Date formatting error:", e);
        return dateString;
      }
    };

    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);

    // Prepare requirements list
    const requirementsList = requirements.split(",").map((item) => item.trim());

    const mailOptions = {
      from: {
        name: "Mobitel Intern Management System",
        address: process.env.EMAIL_USER,
      },
      to: recipientEmail,
      subject: `Induction Program Assignment - ${inductionName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Dear ${recipientName},</p>
          
          <p>Congratulations! We are pleased to inform you that you have been selected to participate in our upcoming induction program at Sri Lanka Telecom Mobitel.</p>
          
          <h3 style="color: #0056b3;">Program Details</h3>
          <ul>
            <li><strong>Reference Number:</strong> ${refNo}</li>
            <li><strong>Program Name:</strong> ${inductionName}</li>
            <li><strong>Dates:</strong> ${formattedStartDate} to ${formattedEndDate}</li>
            <li><strong>Reporting Time:</strong> 8:30 AM on first day</li>
            <li><strong>Location:</strong> ${location}</li>
          </ul>
          
          <h3 style="color: #0056b3;">What to Bring</h3>
          <ol>
            ${requirementsList.map((item) => `<li>${item}</li>`).join("")}
          </ol>
          
          <h3 style="color: #0056b3;">Program Overview</h3>
          <ul>
            <li>Company introduction and orientation</li>
            <li>Health and safety training</li>
            <li>IT systems and security protocols</li>
            <li>Departmental introductions</li>
            <li>Intern policies and procedures</li>
          </ul>
          
          <h3 style="color: #0056b3;">Important Notes</h3>
          <ul>
            <li>Please confirm your attendance via the intern portal</li>
            <li>Full attendance is mandatory</li>
            <li>Business casual attire required</li>
            <li>Lunch will be provided</li>
          </ul>
          
          <p>For questions or accommodations, contact <a href="mailto:hr.interns@mobitel.lk">hr.interns@mobitel.lk</a> at least 3 days prior.</p>
          
          <p>We look forward to welcoming you to the Mobitel team!</p>
          
          <p>Best regards,<br>
          <strong>HR Department</strong><br>
          Sri Lanka Telecom Mobitel</p>
          
          <p style="font-size: 0.8em; color: #666;">
            This is an automated message. Please do not reply directly to this email.
          </p>
        </div>
      `,
      text: `/* Plain text version similar to HTML `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("Induction email sent successfully", {
        to: recipientEmail,
        messageId: info.messageId,
        timestamp: new Date().toISOString(),
      });
  
      return info;
    } catch (error) {
      console.error("Failed to send induction email:", {
        error: error.message,
        recipient: recipientEmail,
        timestamp: new Date().toISOString(),
      });
      throw error;
    } finally {
      if (transporter) {
        transporter.close();
      }
    }
  };*/
