import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { ArrowRight } from 'lucide-react-native';

export default function LoginFlow({
  isLogin,
  isForgot,
  forgotStep,
  forgotQuestion,
  formData,
  error,
  isSubmitting,
  showPassword,
  showNewPassword,
  handleChange,
  handleSubmit,
  switchToForgot,
  switchToSignup,
  switchToLogin,
  LabelledInput,
  styles,
  T,
  setShowPassword,
  setShowNewPassword,
}) {
  if (!isLogin && !isForgot) {
    return null;
  }

  return (
    <>
      {isLogin && (
        <>
          <LabelledInput
            label="EMAIL OR USERNAME"
            placeholder="e.g. rahul_yaari"
            value={formData.identifier}
            onChangeText={(v) => handleChange('identifier', v)}
            autoCapitalize="none"
            returnKeyType="next"
          />
          <LabelledInput
            label="PASSWORD"
            rightLabel="Forgot Password?"
            onRightLabelPress={switchToForgot}
            placeholder="********"
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

      {isForgot && forgotStep === 1 && (
        <LabelledInput
          label="EMAIL OR USERNAME"
          placeholder="Enter your username or email"
          value={formData.identifier}
          onChangeText={(v) => handleChange('identifier', v)}
          autoCapitalize="none"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />
      )}

      {isForgot && forgotStep === 2 && (
        <>
          <View style={styles.questionCard}>
            <Text style={styles.questionLabel}>SECURITY QUESTION</Text>
            <Text style={styles.questionText}>{forgotQuestion}</Text>
          </View>
          <LabelledInput
            label="YOUR ANSWER"
            placeholder="Enter your answer"
            value={formData.forgotAnswer}
            onChangeText={(v) => handleChange('forgotAnswer', v)}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />
        </>
      )}

      {isForgot && forgotStep === 3 && (
        <LabelledInput
          label="NEW PASSWORD"
          placeholder="Enter a new password"
          value={formData.newPassword}
          onChangeText={(v) => handleChange('newPassword', v)}
          secureTextEntry
          showToggle
          showingPassword={showNewPassword}
          onToggle={() => setShowNewPassword((prev) => !prev)}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />
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
              {isLogin
                ? 'Continue to CityYaari'
                : forgotStep === 1
                  ? 'Continue'
                  : forgotStep === 2
                    ? 'Verify Answer'
                    : 'Update Password'}
            </Text>
            <View style={styles.submitIcon}>
              <ArrowRight size={15} color={T.white} />
            </View>
          </>
        )}
      </TouchableOpacity>

      {isLogin && (
        <TouchableOpacity style={styles.toggleBtn} onPress={switchToSignup}>
          <Text style={styles.toggleText}>
            {"Don't have an account? "}
            <Text style={styles.toggleLink}>Register</Text>
          </Text>
        </TouchableOpacity>
      )}

      {isForgot && (
        <TouchableOpacity style={styles.toggleBtn} onPress={switchToLogin}>
          <Text style={styles.toggleText}>
            {'Remembered it? '}
            <Text style={styles.toggleLink}>Back to login</Text>
          </Text>
        </TouchableOpacity>
      )}
    </>
  );
}
