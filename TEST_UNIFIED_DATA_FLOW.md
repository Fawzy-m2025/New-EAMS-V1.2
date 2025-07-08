# Unified Data Flow Test Guide

This guide provides steps to test the Unified Data Flow implementation for vibration data in the EAMS application. The goal is to verify that all analytics, predictions, and ML outputs are updated when new vibration data is entered.

## Prerequisites

- Ensure the application is running and you are logged in.
- Have access to the Vibration Data Entry Form in the Maintenance section.
- Note the current state of Condition Monitoring KPIs, Advanced Predictive Analytics (APA) tabs, and Enhanced ML Pipelines for a specific piece of equipment (e.g., a pump or motor) before entering new data.

## Test Steps

### Step 1: Access Vibration Data Entry Form
1. Navigate to the Maintenance section of the application.
2. Open the Vibration Data Entry Form for entering new vibration data.

### Step 2: Select Equipment
1. In the form, select a specific pump and motor for which you want to test the data flow.
2. Fill in the required fields such as Date and Pump No. Ensure you note down the equipment IDs for reference.

### Step 3: Enter Sample Vibration Data
1. Enter the following sample vibration data for the selected pump and motor:
   - **Pump NDE**: velV: 2.0, velH: 1.5, velAxl: 1.8
   - **Pump DE**: velV: 2.2, velH: 1.7, velAxl: 2.0
   - **Motor NDE**: velV: 1.8, velH: 1.4, velAxl: 1.6
   - **Motor DE**: velV: 2.1, velH: 1.6, velAxl: 1.9
   - Fill other fields as necessary but ensure the above velocity values are entered to simulate a noticeable change.
2. **Required Fields**: Ensure the following fields are filled out as they are mandatory for successful submission:
   - **Date**: Select a date for the measurement.
   - **Pump No.**: Enter a unique identifier for the pump.
   - Other fields like Zone, Pump ID, and Motor ID may also be necessary depending on your system configuration. Fields marked with a red border or asterisk (*) are typically required.
3. Submit the form by clicking the "Submit" button.
4. **Important**: After submission, you should see a confirmation message or toast notification indicating "Vibration data submitted successfully. All analytics have been updated." If you do not see this message, refer to the Troubleshooting section below.

### Step 4: Verify Updates in Condition Monitoring
1. Navigate to the Condition Monitoring section or dashboard.
2. Check if the KPIs and charts for the selected equipment reflect the new vibration data:
   - Look for updated RMS Velocity values.
   - Check if any alerts or status indicators have changed based on the new data (e.g., ISO 10816 Zone changes).

### Step 5: Verify Updates in Advanced Predictive Analytics (APA)
1. Go to the APA tabs or section.
2. Confirm that the following have been recalculated with the new vibration data:
   - Health scores and risk levels for the equipment.
   - Weibull analysis showing updated failure probabilities.
   - Predictive alerts reflecting any new high-risk conditions.

### Step 6: Verify Updates in Enhanced ML Pipelines
1. Access the ML Pipelines section.
2. Verify that the ML models have updated their outputs based on the new data:
   - Check for anomaly detection flags if the entered data indicates an anomaly.
   - Look for updated Remaining Useful Life (RUL) predictions.
   - Review risk assessments and recommendations for the equipment.

### Step 7: Record Observations
1. Note down any discrepancies or areas where updates did not propagate as expected.
2. Confirm if all modules (Condition Monitoring, APA, ML Pipelines) updated instantly after data submission.

## Expected Results
- All relevant dashboards and analytics should reflect the new vibration data immediately after submission.
- Condition Monitoring should show updated KPIs, alerts, and trend charts.
- APA should display recalculated health scores, risk levels, and predictive alerts.
- ML Pipelines should update anomaly detection, RUL predictions, and risk assessments.
- A confirmation message should appear upon successful submission of the form.

## Troubleshooting
- **No Confirmation Message After Submission**: If you do not see a confirmation message or toast after clicking "Submit", ensure that all required fields are filled. Required fields include **Date** and **Pump No.**. Check for any fields marked with a red border or an asterisk (*) as these indicate mandatory fields. If the issue persists after filling all required fields, check for any error messages in the application or browser console. Restarting the application or refreshing the page might help.
- **Updates Not Appearing**: If updates do not appear in the dashboards or analytics, ensure the application is using the latest data by refreshing the page. Verify that the `dataUpdateTrigger` mechanism is functioning by checking console logs or debugging the application if necessary.
- **Form Not Closing After Submission**: The form should close automatically after successful submission. If it does not, there might be an issue with the form validation or submission logic. Check for any error indicators on the form fields.
- **General Issues**: If you encounter any other unexpected behavior, note the specific steps leading to the issue and any error messages. Contact support or refer to the application logs for more detailed error information.

## User Feedback
Your feedback is crucial for improving the system. After completing the test, please provide detailed feedback on the following:
- Did you receive a confirmation message after submitting the form?
- Were all analytics and dashboards updated as expected?
- Did you encounter any errors or unexpected behavior during the test, especially related to identifying required fields?
- Were the required fields clearly indicated, or do you need better visual cues (e.g., red borders, asterisks) to identify them?
- Any suggestions for improving the user experience or functionality of the Vibration Data Entry Form?

To submit feedback, you can use any in-app feedback mechanism if available, or note your observations and share them with the development team. If you encounter persistent issues, please include screenshots or detailed descriptions of the problem to assist in troubleshooting.

**Note**: This test uses sample data for demonstration. In a real scenario, use actual vibration readings for accurate analytics.
