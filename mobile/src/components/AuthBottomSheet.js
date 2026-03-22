import React, { useState, useEffect, useRef } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../store/AuthContext';

const { height } = Dimensions.get('window');

const T = {
  blueDeep: '#0a1628',
  blueDark: '#0f2044',
  blueMid: '#1a3a6e',
  blueMain: '#1e4fc2',
  blueBright: '#2563eb',
  blueSoft: '#3b82f6',
  bluePale: '#dbeafe',
  blueIce: '#eff6ff',
  accent: '#60a5fa',
  white: '#ffffff',
  ink: '#0a1628',
  ink2: '#334155',
  ink3: '#64748b',
  surface: '#f0f5ff',
  surface2: '#e2ecff',
  error: '#b91c1c',
  errorBg: '#fef2f2',
  errorBorder: '#fecaca',
};

const StepBar = ({ current, total }) => (
  <View style={styles.stepRow}>
    {Array.from({ length: total }).map((_, i) => (
      <View key={i} style={[styles.stepSeg, i < current && styles.stepSegActive]} />
    ))}
  </View>
);

const LabelledInput = ({
  label,
  rightLabel,
  onRightLabelPress,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  showToggle,
  showingPassword,
  onToggle,
  returnKeyType,
  onSubmitEditing,
  multiline,
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.inputGroup}>
      <View style={styles.labelRow}>
        <Text style={styles.inputLabel}>{label}</Text>
        {rightLabel ? (
          <TouchableOpacity onPress={onRightLabelPress}>
            <Text style={styles.rightLabel}>{rightLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={[styles.inputWrap, focused && styles.inputWrapFocused, multiline && styles.inputWrapTall]}>
        <TextInput
          style={[styles.inputField, multiline && styles.inputFieldMultiline]}
          placeholder={placeholder}
          placeholderTextColor={T.ink3}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showingPassword}
          keyboardType={keyboardType || 'default'}
          autoCapitalize={autoCapitalize || 'sentences'}
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          returnKeyType={returnKeyType || 'next'}
          onSubmitEditing={onSubmitEditing}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
        {showToggle && (
          <TouchableOpacity style={styles.eyeBtn} onPress={onToggle}>
            <MaterialIcons
              name={showingPassword ? 'visibility-off' : 'visibility'}
              size={18}
              color={T.ink3}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const OptionCard = ({ label, active, onPress }) => (
  <TouchableOpacity
    style={[styles.optionCard, active && styles.optionCardActive]}
    onPress={onPress}
    activeOpacity={0.85}
  >
    <View style={[styles.optionIndicator, active && styles.optionIndicatorActive]} />
    <Text style={[styles.optionText, active && styles.optionTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const createInitialFormData = () => ({
  fullName: '',
  username: '',
  email: '',
  password: '',
  occupationType: '',
  country: '',
  state: '',
  city: '',
  securityQuestion: '',
  securityAnswer: '',
  identifier: '',
  forgotAnswer: '',
  newPassword: '',
  resetToken: '',
});

const AuthBottomSheet = ({ isVisible, onClose, initialForm = 'login' }) => {
  const [flowType, setFlowType] = useState(initialForm);
  const [signupStep, setSignupStep] = useState(1);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotQuestion, setForgotQuestion] = useState('');
  const [formData, setFormData] = useState(createInitialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    login,
    register,
    getForgotPasswordQuestion,
    verifySecurityAnswer,
    resetForgottenPassword,
  } = useAuth();

  const translateY = useRef(new Animated.Value(height)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    resetFlow(initialForm);
  }, [initialForm]);

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          damping: 22,
          stiffness: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: height,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, opacity, translateY]);

  const resetFlow = (nextFlow) => {
    setFlowType(nextFlow);
    setSignupStep(1);
    setForgotStep(1);
    setForgotQuestion('');
    setFormData(createInitialFormData());
    setShowPassword(false);
    setShowNewPassword(false);
    setError('');
    setIsSubmitting(false);
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (error) setError('');
  };

  const validateCurrentStep = () => {
    if (flowType === 'login') {
      if (!formData.identifier.trim() || !formData.password) {
        setError('Please enter your username or email and password.');
        return false;
      }
      return true;
    }

    if (flowType === 'signup') {
      if (signupStep === 1) {
        if (!formData.fullName.trim() || !formData.username.trim()) {
          setError('Please fill in your full name and username.');
          return false;
        }
      }

      if (signupStep === 2) {
        if (!formData.email.trim() || !formData.password) {
          setError('Please fill in your email and password.');
          return false;
        }
      }

      if (signupStep === 3) {
        if (!formData.occupationType) {
          setError('Please choose whether you are a student or working professional.');
          return false;
        }
      }

      if (signupStep === 4) {
        if (!formData.country.trim() || !formData.state.trim() || !formData.city.trim()) {
          setError('Please fill in your country, state, and city.');
          return false;
        }
      }

      if (signupStep === 5) {
        if (!formData.securityQuestion.trim() || !formData.securityAnswer.trim()) {
          setError('Please add a security question and answer.');
          return false;
        }
      }

      return true;
    }

    if (forgotStep === 1) {
      if (!formData.identifier.trim()) {
        setError('Please enter your username or email.');
        return false;
      }
    }

    if (forgotStep === 2) {
      if (!formData.forgotAnswer.trim()) {
        setError('Please answer your security question.');
        return false;
      }
    }

    if (forgotStep === 3) {
      if (!formData.newPassword) {
        setError('Please enter your new password.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    if (flowType === 'signup' && signupStep < 5) {
      setSignupStep((prev) => prev + 1);
      setError('');
      return;
    }

    setIsSubmitting(true);
    setError('');

    if (flowType === 'login') {
      const result = await login(formData.identifier.trim(), formData.password);
      setIsSubmitting(false);

      if (result.success) {
        onClose();
      } else {
        setError(result.message || 'Something went wrong. Please try again.');
      }
      return;
    }

    if (flowType === 'signup') {
      const result = await register({
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        occupationType: formData.occupationType,
        country: formData.country.trim(),
        state: formData.state.trim(),
        city: formData.city.trim(),
        securityQuestion: formData.securityQuestion.trim(),
        securityAnswer: formData.securityAnswer.trim(),
      });

      setIsSubmitting(false);

      if (result.success) {
        onClose();
      } else {
        setError(result.message || 'Something went wrong. Please try again.');
      }
      return;
    }

    if (forgotStep === 1) {
      const result = await getForgotPasswordQuestion(formData.identifier.trim());
      setIsSubmitting(false);

      if (result.success) {
        setForgotQuestion(result.securityQuestion);
        setForgotStep(2);
      } else {
        setError(result.message || 'Could not find that account.');
      }
      return;
    }

    if (forgotStep === 2) {
      const result = await verifySecurityAnswer(formData.identifier.trim(), formData.forgotAnswer.trim());
      setIsSubmitting(false);

      if (result.success) {
        setFormData((prev) => ({ ...prev, resetToken: result.resetToken }));
        setForgotStep(3);
      } else {
        setError(result.message || 'That answer did not match.');
      }
      return;
    }

    const result = await resetForgottenPassword(formData.resetToken, formData.newPassword);
    setIsSubmitting(false);

    if (result.success) {
      const updatedIdentifier = formData.identifier.trim();
      setFlowType('login');
      setSignupStep(1);
      setForgotStep(1);
      setForgotQuestion('');
      setFormData({ ...createInitialFormData(), identifier: updatedIdentifier });
      setShowPassword(false);
      setShowNewPassword(false);
      setError('Password updated. You can log in now.');
    } else {
      setError(result.message || 'Could not reset password.');
    }
  };

  const switchToSignup = () => resetFlow('signup');
  const switchToLogin = () => resetFlow('login');
  const switchToForgot = () => {
    setFlowType('forgot');
    setForgotStep(1);
    setForgotQuestion('');
    setFormData((prev) => ({
      ...createInitialFormData(),
      identifier: prev.identifier,
    }));
    setShowPassword(false);
    setShowNewPassword(false);
    setError('');
  };

  const handleBack = () => {
    if (flowType === 'signup' && signupStep > 1) {
      setSignupStep((prev) => prev - 1);
      setError('');
      return;
    }

    if (flowType === 'forgot' && forgotStep > 1) {
      if (forgotStep === 2) {
        setForgotQuestion('');
      }
      if (forgotStep === 3) {
        setFormData((prev) => ({ ...prev, resetToken: '', newPassword: '' }));
      }
      setForgotStep((prev) => prev - 1);
      setError('');
      return;
    }

    if (flowType === 'forgot') {
      switchToLogin();
      return;
    }

    onClose();
  };

  if (!isVisible && translateY._value === height) return null;

  const isLogin = flowType === 'login';
  const isSignup = flowType === 'signup';
  const isForgot = flowType === 'forgot';

  const signupMeta = [
    { eyebrow: 'New to CityYaari', title: 'Create your\nprofile', button: 'Continue' },
    { eyebrow: 'Set your login', title: 'Add your\ncredentials', button: 'Continue' },
    { eyebrow: 'A bit more', title: 'Choose your\ncurrent stage', button: 'Continue' },
    { eyebrow: 'Local context', title: 'Tell us where\nyou are', button: 'Continue' },
    { eyebrow: 'Keep it secure', title: 'Set recovery\nquestion', button: 'Create Account' },
  ][signupStep - 1];

  const forgotMeta = [
    { eyebrow: 'Recover access', title: 'Find your\naccount', button: 'Continue' },
    { eyebrow: 'Security check', title: 'Answer your\nquestion', button: 'Verify Answer' },
    { eyebrow: 'Set new password', title: 'Create a new\npassword', button: 'Update Password' },
  ][forgotStep - 1];

  const eyebrow = isLogin ? 'Welcome back' : isSignup ? signupMeta.eyebrow : forgotMeta.eyebrow;
  const title = isLogin ? 'Log in to\nCityYaari' : isSignup ? signupMeta.title : forgotMeta.title;
  const btnLabel = isLogin
    ? 'Continue to CityYaari'
    : isSignup
      ? signupMeta.button
      : forgotMeta.button;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={isVisible ? 'auto' : 'none'}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity }]} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.sheetWrapper}
      >
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View style={styles.dragPill} />

          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={handleBack}
              style={styles.headerBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.headerBtnText}>
                {(isSignup && signupStep > 1) || (isForgot && forgotStep > 1) ? '<-' : 'x'}
              </Text>
            </TouchableOpacity>

            {isSignup && <StepBar current={signupStep} total={5} />}
            {isForgot && <StepBar current={forgotStep} total={3} />}
            {isLogin && <View style={styles.stepSpacer} />}

            <View style={styles.headerBtn} />
          </View>

          {(isSignup || isForgot) && (
            <View style={styles.blueTag}>
              <View style={styles.blueTagDot} />
              <Text style={styles.blueTagText}>
                {isSignup ? `Step ${signupStep} of 5` : `Step ${forgotStep} of 3`}
              </Text>
            </View>
          )}

          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.sheetTitle}>{title}</Text>

          {error ? (
            <View style={[styles.errorWrap, error === 'Password updated. You can log in now.' && styles.successWrap]}>
              <Text style={[styles.errorText, error === 'Password updated. You can log in now.' && styles.successText]}>
                {error}
              </Text>
            </View>
          ) : null}

          <View style={styles.form}>
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

            {isSignup && signupStep === 1 && (
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

            {isSignup && signupStep === 2 && (
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

            {isSignup && signupStep === 3 && (
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

            {isSignup && signupStep === 4 && (
              <>
                <LabelledInput
                  label="COUNTRY"
                  placeholder="e.g. India"
                  value={formData.country}
                  onChangeText={(v) => handleChange('country', v)}
                />
                <LabelledInput
                  label="STATE"
                  placeholder="e.g. Karnataka"
                  value={formData.state}
                  onChangeText={(v) => handleChange('state', v)}
                />
                <LabelledInput
                  label="CITY"
                  placeholder="e.g. Bengaluru"
                  value={formData.city}
                  onChangeText={(v) => handleChange('city', v)}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
              </>
            )}

            {isSignup && signupStep === 5 && (
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
                  <Text style={styles.submitText}>{btnLabel}</Text>
                  <View style={styles.submitIcon}>
                    <Text style={styles.submitArrow}>{'->'}</Text>
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

            {isSignup && (
              <TouchableOpacity style={styles.toggleBtn} onPress={switchToLogin}>
                <Text style={styles.toggleText}>
                  {'Already a member? '}
                  <Text style={styles.toggleLink}>Log in</Text>
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
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,22,40,0.55)',
  },
  sheetWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: T.white,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 26,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 52 : 36,
    shadowColor: T.blueMain,
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 30,
  },
  dragPill: {
    width: 36,
    height: 4,
    backgroundColor: T.surface2,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 12,
  },
  headerBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnText: {
    fontSize: 17,
    color: T.ink3,
    lineHeight: 22,
  },
  stepSpacer: {
    flex: 1,
  },
  stepRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 4,
  },
  stepSeg: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: T.surface2,
  },
  stepSegActive: {
    backgroundColor: T.blueMain,
  },
  blueTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: T.bluePale,
    borderRadius: 100,
    paddingHorizontal: 11,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  blueTagDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: T.blueSoft,
  },
  blueTagText: {
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-medium',
    fontSize: 10,
    fontWeight: '700',
    color: '#1e40af',
    letterSpacing: 0.2,
  },
  eyebrow: {
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-medium',
    fontSize: 10,
    fontWeight: '700',
    color: T.blueSoft,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  sheetTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 27,
    fontWeight: '700',
    color: T.ink,
    lineHeight: 32,
    letterSpacing: -0.6,
    marginBottom: 18,
  },
  errorWrap: {
    backgroundColor: T.errorBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: T.errorBorder,
  },
  successWrap: {
    backgroundColor: '#effdf4',
    borderColor: '#bbf7d0',
  },
  errorText: {
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    fontSize: 13,
    color: T.error,
    textAlign: 'center',
  },
  successText: {
    color: '#166534',
  },
  form: {
    gap: 13,
  },
  inputGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  inputLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-medium',
    fontSize: 10,
    fontWeight: '700',
    color: T.ink3,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  rightLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-medium',
    fontSize: 11,
    fontWeight: '600',
    color: T.blueSoft,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
    height: 50,
    paddingHorizontal: 16,
  },
  inputWrapTall: {
    minHeight: 84,
    height: 'auto',
    paddingTop: 14,
    paddingBottom: 14,
    alignItems: 'flex-start',
  },
  inputWrapFocused: {
    backgroundColor: T.white,
    borderColor: T.blueMain,
  },
  inputField: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    fontSize: 15,
    color: T.ink,
    height: '100%',
  },
  inputFieldMultiline: {
    minHeight: 56,
  },
  eyeBtn: {
    paddingLeft: 10,
    paddingVertical: 4,
    minWidth: 28,
    alignItems: 'center',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: T.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  optionCardActive: {
    backgroundColor: '#eef4ff',
    borderColor: T.blueMain,
  },
  optionIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: T.ink3,
  },
  optionIndicatorActive: {
    backgroundColor: T.blueMain,
    borderColor: T.blueMain,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: T.ink2,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
  },
  optionTextActive: {
    color: T.ink,
    fontWeight: '700',
  },
  questionCard: {
    backgroundColor: T.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.surface2,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
  },
  questionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: T.ink3,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: 15,
    lineHeight: 22,
    color: T.ink,
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
  },
  submitBtn: {
    width: '100%',
    height: 52,
    backgroundColor: T.blueMain,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 4,
    shadowColor: T.blueMain,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 8,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-medium',
    fontSize: 15,
    fontWeight: '600',
    color: T.white,
    letterSpacing: 0.1,
  },
  submitIcon: {
    width: 26,
    height: 26,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitArrow: {
    color: T.white,
    fontSize: 12,
    fontWeight: '700',
  },
  toggleBtn: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  toggleText: {
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    fontSize: 13,
    color: T.ink3,
  },
  toggleLink: {
    color: T.blueMain,
    fontWeight: '700',
    textDecorationLine: 'underline',
    textDecorationColor: T.accent,
    textDecorationStyle: 'solid',
  },
});

export default AuthBottomSheet;
