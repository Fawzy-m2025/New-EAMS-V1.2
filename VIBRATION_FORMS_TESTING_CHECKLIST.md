# 🧪 Vibration Forms Synchronization Testing Checklist

## **Prerequisites**
- [ ] Start the development server: `npm run dev`
- [ ] Navigate to `localhost:8080`
- [ ] Open browser developer tools (F12)
- [ ] Clear browser cache and local storage

---

## **1. Data Structure Synchronization Tests**

### **Test 1.1: VibrationDataEntryForm Data Conversion**
- [ ] Open VibrationDataEntryForm
- [ ] Fill in vibration measurements:
  - Pump NDE: velV=2.0, velH=1.8, velAxl=1.9, temp=65
  - Pump DE: velV=2.2, velH=2.0, velAxl=2.1, temp=67
  - Motor NDE: velV=1.7, velH=1.5, velAxl=1.6, temp=62
  - Motor DE: velV=1.8, velH=1.6, velAxl=1.7, temp=63
- [ ] Submit form
- [ ] Check console for `vibrationData` object structure
- [ ] Verify both legacy fields (`pumpNDE_velV`) and unified fields exist

### **Test 1.2: EnhancedVibrationForm Data Conversion**
- [ ] Open EnhancedVibrationForm
- [ ] Navigate to Vibration Measurements step
- [ ] Fill in similar values using enhanced format
- [ ] Submit form
- [ ] Check console for unified `vibrationData` structure
- [ ] Verify compatibility fields are mapped correctly

### **Test 1.3: Data Consistency Verification**
- [ ] Submit same vibration values in both forms
- [ ] Compare the generated `VibrationHistoryRecord` objects
- [ ] Verify `vibrationRMS` calculations match
- [ ] Check that legacy flat structure is identical

---

## **2. ISO 10816 Compliance Tests**

### **Test 2.1: Zone Classification Consistency**
- [ ] Enter velocity values for each ISO zone:
  - Zone A: velV=1.5, velH=1.4, velAxl=1.3
  - Zone B: velV=3.0, velH=2.8, velAxl=2.9
  - Zone C: velV=6.0, velH=5.8, velAxl=5.9
  - Zone D: velV=8.0, velH=7.8, velAxl=7.9
- [ ] Verify color coding matches in both forms:
  - Zone A: Green background
  - Zone B: Yellow background
  - Zone C: Orange background
  - Zone D: Red background
- [ ] Check RMS calculations are identical
- [ ] Verify zone badges show same classification

### **Test 2.2: Real-time Zone Updates**
- [ ] Start with Zone A values
- [ ] Gradually increase values and watch zone changes
- [ ] Verify both forms update zones simultaneously
- [ ] Check that warnings appear at Zone C/D thresholds

---

## **3. Equipment Integration Tests**

### **Test 3.1: Hierarchical Equipment Selection**
- [ ] Test Zone → Station → Equipment selection flow
- [ ] Verify both forms use same equipment data source
- [ ] Check equipment details populate correctly:
  - Asset tag
  - Manufacturer
  - Model
  - Location path
- [ ] Verify equipment filtering works identically

### **Test 3.2: Equipment Data Mapping**
- [ ] Select same equipment in both forms
- [ ] Verify all equipment fields populate identically
- [ ] Check specifications mapping
- [ ] Test with different equipment categories (pump, motor, compressor)

---

## **4. Validation Rules Tests**

### **Test 4.1: Required Field Validation**
- [ ] Try submitting forms with missing required fields
- [ ] Verify identical error messages in both forms
- [ ] Check error styling consistency
- [ ] Test date, equipment, and pump number requirements

### **Test 4.2: Range Validation**
- [ ] Test invalid vibration values:
  - Negative values: velV=-1.0
  - Excessive values: velV=150.0
  - Invalid temperature: temp=300
- [ ] Verify both forms show same validation errors
- [ ] Check error message consistency

### **Test 4.3: ISO 10816 Warnings**
- [ ] Enter Zone D values (>7.1 mm/s)
- [ ] Verify critical warnings appear in both forms
- [ ] Check warning message consistency
- [ ] Test maintenance recommendation generation

---

## **5. User Interface Consistency Tests**

### **Test 5.1: Input Color Coding**
- [ ] Enter various vibration values
- [ ] Verify input field colors match ISO zones
- [ ] Check color consistency between forms
- [ ] Test dark/light theme compatibility

### **Test 5.2: Tooltip Consistency**
- [ ] Hover over vibration input fields
- [ ] Verify tooltip content matches between forms
- [ ] Check ISO 10816 guidance is identical
- [ ] Test different field types (velocity, acceleration, temperature)

### **Test 5.3: Form Layout Preservation**
- [ ] Verify VibrationDataEntryForm maintains single-page layout
- [ ] Check EnhancedVibrationForm keeps multi-step wizard
- [ ] Ensure unique features are preserved
- [ ] Test responsive design on different screen sizes

---

## **6. Data Submission and Storage Tests**

### **Test 6.1: VibrationHistoryRecord Creation**
- [ ] Submit data from both forms
- [ ] Check generated records in browser storage/context
- [ ] Verify record structure consistency
- [ ] Compare metadata fields (timestamps, operator, etc.)

### **Test 6.2: AssetContext Integration**
- [ ] Submit vibration data
- [ ] Check AssetContext updates
- [ ] Verify condition monitoring integration
- [ ] Test real-time data propagation

### **Test 6.3: Audit Trail Verification**
- [ ] Submit multiple records
- [ ] Check audit trail completeness
- [ ] Verify timestamp accuracy
- [ ] Test data versioning

---

## **7. AI Assessment Integration Tests**

### **Test 7.1: Condition Assessment Consistency**
- [ ] Enter identical vibration data in both forms
- [ ] Compare AI-generated condition assessments
- [ ] Verify priority levels match
- [ ] Check maintenance recommendations consistency

### **Test 7.2: Health Score Calculation**
- [ ] Test with various vibration scenarios
- [ ] Verify health scores are calculated identically
- [ ] Check confidence levels
- [ ] Test risk level assessments

---

## **8. Performance and Integration Tests**

### **Test 8.1: Form Loading Performance**
- [ ] Measure form loading times
- [ ] Check for console errors
- [ ] Verify equipment data loads correctly
- [ ] Test with large equipment datasets (350+ items)

### **Test 8.2: Real-time Updates**
- [ ] Submit data and check immediate UI updates
- [ ] Verify condition monitoring reflects changes
- [ ] Test predictive analytics integration
- [ ] Check maintenance scheduling updates

### **Test 8.3: Cross-Module Integration**
- [ ] Navigate to Condition Monitoring after data entry
- [ ] Verify vibration data appears correctly
- [ ] Check Asset Performance module integration
- [ ] Test Asset Depreciation calculations

---

## **9. Error Handling Tests**

### **Test 9.1: Network Error Simulation**
- [ ] Disconnect network during form submission
- [ ] Verify error handling consistency
- [ ] Check data preservation
- [ ] Test retry mechanisms

### **Test 9.2: Invalid Data Handling**
- [ ] Submit malformed data
- [ ] Verify graceful error handling
- [ ] Check error message clarity
- [ ] Test data sanitization

---

## **10. Browser Compatibility Tests**

### **Test 10.1: Cross-Browser Testing**
- [ ] Test in Chrome (latest)
- [ ] Test in Firefox (latest)
- [ ] Test in Safari (if available)
- [ ] Test in Edge (latest)
- [ ] Verify consistent behavior across browsers

### **Test 10.2: Mobile Responsiveness**
- [ ] Test on mobile devices/emulation
- [ ] Verify touch interactions work
- [ ] Check form layout on small screens
- [ ] Test data entry on mobile keyboards

---

## **✅ Success Criteria**

All tests should demonstrate:
- ✅ **Data Consistency**: Both forms produce identical vibration data structures
- ✅ **ISO 10816 Compliance**: Consistent zone calculations and color coding
- ✅ **Equipment Integration**: Identical equipment selection and data mapping
- ✅ **Validation Consistency**: Same validation rules and error messages
- ✅ **UI Consistency**: Consistent styling, tooltips, and user interactions
- ✅ **Performance**: No degradation in form loading or submission times
- ✅ **Integration**: Seamless data flow to all EAMS modules
- ✅ **Backward Compatibility**: Existing functionality remains intact

---

## **🐛 Issue Reporting Template**

When issues are found, report using this format:

```
**Issue**: [Brief description]
**Form**: [VibrationDataEntryForm / EnhancedVibrationForm / Both]
**Steps to Reproduce**: 
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior**: [What should happen]
**Actual Behavior**: [What actually happens]
**Browser**: [Browser and version]
**Console Errors**: [Any console errors]
**Screenshots**: [If applicable]
```
