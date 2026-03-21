import React, { useState, useEffect, useRef } from 'react';
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

// ─── Design Tokens ─────────────────────────────────────────────────────────
const T = {
  blueDeep:   '#0a1628',
  blueDark:   '#0f2044',
  blueMid:    '#1a3a6e',
  blueMain:   '#1e4fc2',
  blueBright: '#2563eb',
  blueSoft:   '#3b82f6',
  bluePale:   '#dbeafe',
  blueIce:    '#eff6ff',
  accent:     '#60a5fa',
  white:      '#ffffff',
  ink:        '#0a1628',
  ink2:       '#334155',
  ink3:       '#64748b',
  surface:    '#f0f5ff',
  surface2:   '#e2ecff',
  error:      '#b91c1c',
  errorBg:    '#fef2f2',
  errorBorder:'#fecaca',
};

// ─── Step Progress Bar ──────────────────────────────────────────────────────
const StepBar = ({ current, total }) => (
  <View style={styles.stepRow}>
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={[styles.stepSeg, i < current && styles.stepSegActive]}
      />
    ))}
  </View>
);

// ─── Labelled Input ─────────────────────────────────────────────────────────
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

      <View style={[styles.inputWrap, focused && styles.inputWrapFocused]}>
        <TextInput
          style={styles.inputField}
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
        />
        {showToggle && (
          <TouchableOpacity style={styles.eyeBtn} onPress={onToggle}>
            <Text style={styles.eyeIcon}>{showingPassword ? '○' : '●'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
const AuthBottomSheet = ({ isVisible, onClose, initialForm = 'login' }) => {
  const [formType,    setFormType]    = useState(initialForm);
  const [signupStep,  setSignupStep]  = useState(1);
  const [formData,    setFormData]    = useState({
    fullName: '', username: '', email: '', password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();

  const translateY = useRef(new Animated.Value(height)).current;
  const opacity    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setFormType(initialForm);
    setSignupStep(1);
    setError('');
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
  }, [isVisible]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (error) setError('');
  };

  const validate = () => {
    if (formType === 'login') {
      if (!formData.username.trim() || !formData.password) {
        setError('Please enter your credentials.'); return false;
      }
    } else if (signupStep === 1) {
      if (!formData.fullName.trim() || !formData.username.trim()) {
        setError('Please fill in all fields.'); return false;
      }
    } else {
      if (!formData.email.trim() || !formData.password) {
        setError('Please fill in all fields.'); return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    if (formType === 'signup' && signupStep === 1) {
      setSignupStep(2);
      setError('');
      return;
    }

    setIsSubmitting(true);
    setError('');

    let result;
    if (formType === 'login') {
      result = await login(
        formData.username.trim() || formData.email.trim(),
        formData.password,
      );
    } else {
      result = await register(
        formData.fullName,
        formData.username,
        formData.email,
        formData.password,
      );
    }

    if (result.success) {
      onClose();
    } else {
      setError(result.message || 'Something went wrong. Please try again.');
    }
    setIsSubmitting(false);
  };

  const toggleForm = () => {
    setFormType((p) => (p === 'login' ? 'signup' : 'login'));
    setSignupStep(1);
    setError('');
    setFormData({ fullName: '', username: '', email: '', password: '' });
  };

  const handleBack = () => {
    if (formType === 'signup' && signupStep === 2) {
      setSignupStep(1);
      setError('');
    } else {
      onClose();
    }
  };

  if (!isVisible && translateY._value === height) return null;

  const isLogin   = formType === 'login';
  const isSignup1 = formType === 'signup' && signupStep === 1;
  const isSignup2 = formType === 'signup' && signupStep === 2;

  const eyebrow  = isLogin ? 'Welcome back' : isSignup1 ? 'New to CityYaari' : 'Almost there';
  const title    = isLogin ? `Log in to\nCityYaari` : isSignup1 ? `Create your\nprofile` : `Set your\ncredentials`;
  const btnLabel = isLogin ? 'Continue to CityYaari' : isSignup1 ? 'Continue' : 'Create Account';

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents={isVisible ? 'auto' : 'none'}
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity }]} />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.sheetWrapper}
      >
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>

          {/* Drag pill */}
          <View style={styles.dragPill} />

          {/* Header row */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={handleBack}
              style={styles.headerBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.headerBtnText}>
                {isSignup2 ? '←' : '✕'}
              </Text>
            </TouchableOpacity>

            {formType === 'signup' && <StepBar current={signupStep} total={2} />}

            <View style={styles.headerBtn} />
          </View>

          {/* Blue step tag — signup only */}
          {formType === 'signup' && (
            <View style={styles.blueTag}>
              <View style={styles.blueTagDot} />
              <Text style={styles.blueTagText}>
                Step {signupStep} of 2
              </Text>
            </View>
          )}

          {/* Eyebrow + title */}
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.sheetTitle}>{title}</Text>

          {/* Error */}
          {error ? (
            <View style={styles.errorWrap}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* ── Fields ── */}
          <View style={styles.form}>

            {isLogin && (
              <>
                <LabelledInput
                  label="EMAIL OR USERNAME"
                  placeholder="e.g. rahul_yaari"
                  value={formData.username}
                  onChangeText={(v) => handleChange('username', v)}
                  autoCapitalize="none"
                  returnKeyType="next"
                />
                <LabelledInput
                  label="PASSWORD"
                  rightLabel="Forgot?"
                  placeholder="••••••••"
                  value={formData.password}
                  onChangeText={(v) => handleChange('password', v)}
                  secureTextEntry
                  showToggle
                  showingPassword={showPassword}
                  onToggle={() => setShowPassword((p) => !p)}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
              </>
            )}

            {isSignup1 && (
              <>
                <LabelledInput
                  label="FULL NAME"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.fullName}
                  onChangeText={(v) => handleChange('fullName', v)}
                  returnKeyType="next"
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

            {isSignup2 && (
              <>
                <LabelledInput
                  label="EMAIL ADDRESS"
                  placeholder="rahul@example.com"
                  value={formData.email}
                  onChangeText={(v) => handleChange('email', v)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="next"
                />
                <LabelledInput
                  label="PASSWORD"
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChangeText={(v) => handleChange('password', v)}
                  secureTextEntry
                  showToggle
                  showingPassword={showPassword}
                  onToggle={() => setShowPassword((p) => !p)}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
              </>
            )}

            {/* Submit */}
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
                    <Text style={styles.submitArrow}>→</Text>
                  </View>
                </>
              )}
            </TouchableOpacity>

            {/* Toggle */}
            <TouchableOpacity style={styles.toggleBtn} onPress={toggleForm}>
              <Text style={styles.toggleText}>
                {isLogin ? "Don't have an account? " : 'Already a member? '}
                <Text style={styles.toggleLink}>
                  {isLogin ? 'Register' : 'Log in'}
                </Text>
              </Text>
            </TouchableOpacity>

          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};

// ─── Styles ─────────────────────────────────────────────────────────────────
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

  /* Drag pill */
  dragPill: {
    width: 36,
    height: 4,
    backgroundColor: T.surface2,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },

  /* Header */
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

  /* Step bar */
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

  /* Blue tag */
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

  /* Copy */
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

  /* Error */
  errorWrap: {
    backgroundColor: T.errorBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: T.errorBorder,
  },
  errorText: {
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    fontSize: 13,
    color: T.error,
    textAlign: 'center',
  },

  /* Form */
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
    letterSpacing: 1.0,
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
  eyeBtn: {
    paddingLeft: 10,
    paddingVertical: 4,
  },
  eyeIcon: {
    fontSize: 11,
    color: T.ink3,
  },

  /* Submit */
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

  /* Toggle */
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