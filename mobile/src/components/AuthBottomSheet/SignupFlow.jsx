import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { ArrowRight } from 'lucide-react-native';

export default function SignupFlow({
  isSignup,
  signupStep,
  formData,
  isSubmitting,
  handleChange,
  handleSubmit,
  switchToLogin,
  LabelledInput,
  OptionCard,
  SelectionField,
  styles,
  T,
  showPassword,
  setShowPassword,
  selectedCountryLabel,
  selectedStateLabel,
  selectedCityLabel,
  countryIsOther,
  stateIsOther,
  cityIsOther,
  pickerLoading,
  pickerType,
  openPicker,
}) {
  if (!isSignup) {
    return null;
  }

  return (
    <>
      {signupStep === 1 && (
        <>
          <LabelledInput
            label="FULL NAME"
            placeholder="e.g. Rahul Sharma"
            value={formData.fullName}
            onChangeText={(v) => handleChange('fullName', v)}
          />
          <LabelledInput
            label="USERNAME"
            placeholder="rahul_yaari"
            value={formData.username}
            onChangeText={(v) => handleChange('username', v)}
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />
        </>
      )}

      {signupStep === 2 && (
        <>
          <LabelledInput
            label="EMAIL ADDRESS"
            placeholder="rahul@example.com"
            value={formData.email}
            onChangeText={(v) => handleChange('email', v)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <LabelledInput
            label="PASSWORD"
            placeholder="Min. 6 characters"
            value={formData.password}
            onChangeText={(v) => handleChange('password', v)}
            secureTextEntry
            showToggle
            showingPassword={showPassword}
            onToggle={() => setShowPassword((prev) => !prev)}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />
        </>
      )}

      {signupStep === 3 && (
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>CURRENT STAGE</Text>
          <OptionCard
            label="I am a student"
            active={formData.occupationType === 'student'}
            onPress={() => handleChange('occupationType', 'student')}
          />
          <OptionCard
            label="I am a working professional"
            active={formData.occupationType === 'working_professional'}
            onPress={() => handleChange('occupationType', 'working_professional')}
          />
        </View>
      )}

      {signupStep === 4 && (
        <>
          <SelectionField
            label="COUNTRY"
            value={selectedCountryLabel}
            placeholder="Select your country"
            onPress={() => openPicker('country')}
            loading={pickerLoading && pickerType === 'country'}
          />
          {countryIsOther && (
            <LabelledInput
              label="ENTER COUNTRY"
              placeholder="Type your country"
              value={formData.country}
              onChangeText={(v) => handleChange('country', v)}
            />
          )}

          <SelectionField
            label="STATE"
            value={selectedStateLabel}
            placeholder={!selectedCountryLabel ? 'Select country first' : 'Select your state'}
            onPress={() => openPicker('state')}
            disabled={!selectedCountryLabel}
            loading={pickerLoading && pickerType === 'state'}
          />
          {stateIsOther && (
            <LabelledInput
              label="ENTER STATE"
              placeholder="Type your state"
              value={formData.state}
              onChangeText={(v) => handleChange('state', v)}
            />
          )}

          <SelectionField
            label="CITY"
            value={selectedCityLabel}
            placeholder={!selectedStateLabel ? 'Select state first' : 'Select your city'}
            onPress={() => openPicker('city')}
            disabled={!selectedStateLabel}
            loading={pickerLoading && pickerType === 'city'}
          />
          {cityIsOther && (
            <LabelledInput
              label="ENTER CITY"
              placeholder="Type your city"
              value={formData.city}
              onChangeText={(v) => handleChange('city', v)}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
          )}
        </>
      )}

      {signupStep === 5 && (
        <>
          <LabelledInput
            label="SECURITY QUESTION"
            placeholder="e.g. What was the name of my first school?"
            value={formData.securityQuestion}
            onChangeText={(v) => handleChange('securityQuestion', v)}
            multiline
          />
          <LabelledInput
            label="SECURITY ANSWER"
            placeholder="Only you should know this"
            value={formData.securityAnswer}
            onChangeText={(v) => handleChange('securityAnswer', v)}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />
        </>
      )}

      <TouchableOpacity
        style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting}
        activeOpacity={0.85}
      >
        {isSubmitting ? (
          <ActivityIndicator color={T.white} />
        ) : (
          <>
            <Text style={styles.submitText}>
              {signupStep === 5 ? 'Create Account' : 'Continue'}
            </Text>
            <View style={styles.submitIcon}>
              <ArrowRight size={15} color={T.white} />
            </View>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.toggleBtn} onPress={switchToLogin}>
        <Text style={styles.toggleText}>
          {'Already a member? '}
          <Text style={styles.toggleLink}>Log in</Text>
        </Text>
      </TouchableOpacity>
    </>
  );
}
