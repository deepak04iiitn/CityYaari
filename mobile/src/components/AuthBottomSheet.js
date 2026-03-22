import React, { useState, useEffect, useRef } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { ArrowLeft, X } from 'lucide-react-native';
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
  Modal,
  FlatList,
} from 'react-native';
import { GetCity, GetCountries, GetState } from 'react-country-state-city';
import LoginFlow from './AuthBottomSheet/LoginFlow';
import SignupFlow from './AuthBottomSheet/SignupFlow';
import { useAuth } from '../store/AuthContext';

const { height } = Dimensions.get('window');
const OTHER_OPTION = { id: -1, name: 'Other', isOther: true };

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

const SelectionField = ({ label, value, placeholder, disabled, onPress, loading }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TouchableOpacity
      style={[styles.selectField, disabled && styles.selectFieldDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      <Text style={[styles.selectText, !value && styles.selectPlaceholder]}>
        {value || placeholder}
      </Text>
      {loading ? (
        <ActivityIndicator size="small" color={T.blueMain} />
      ) : (
        <MaterialIcons
          name="keyboard-arrow-down"
          size={22}
          color={disabled ? '#94a3b8' : T.ink3}
        />
      )}
    </TouchableOpacity>
  </View>
);

const SelectionModal = ({ visible, title, options, loading, onClose, onSelect }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!visible) {
      setQuery('');
    }
  }, [visible]);

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalBackdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{title}</Text>
                <TouchableOpacity onPress={onClose} style={styles.modalClose}>
                  <MaterialIcons name="close" size={20} color={T.ink3} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalSearchWrap}>
                <MaterialIcons name="search" size={18} color={T.ink3} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder={`Search ${title.toLowerCase()}`}
                  placeholderTextColor={T.ink3}
                  style={styles.modalSearchInput}
                />
              </View>

              {loading ? (
                <View style={styles.modalLoaderWrap}>
                  <ActivityIndicator color={T.blueMain} />
                </View>
              ) : (
                <FlatList
                  data={filteredOptions}
                  keyExtractor={(item, index) => `${item.id}-${index}`}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalOption}
                      onPress={() => onSelect(item)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.modalOptionText, item.isOther && styles.modalOtherText]}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <View style={styles.modalEmptyWrap}>
                      <Text style={styles.modalEmptyText}>No matches found.</Text>
                    </View>
                  }
                />
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

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
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerType, setPickerType] = useState('country');
  const [pickerLoading, setPickerLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountryId, setSelectedCountryId] = useState(null);
  const [selectedStateId, setSelectedStateId] = useState(null);
  const [selectedCountryLabel, setSelectedCountryLabel] = useState('');
  const [selectedStateLabel, setSelectedStateLabel] = useState('');
  const [selectedCityLabel, setSelectedCityLabel] = useState('');
  const [countryIsOther, setCountryIsOther] = useState(false);
  const [stateIsOther, setStateIsOther] = useState(false);
  const [cityIsOther, setCityIsOther] = useState(false);

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
    if (!isVisible) {
      return;
    }

    GetCountries()
      .then((data) => {
        setCountries(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setCountries([]);
      });
  }, [isVisible]);

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

  const resetLocationSelection = () => {
    setSelectedCountryId(null);
    setSelectedStateId(null);
    setSelectedCountryLabel('');
    setSelectedStateLabel('');
    setSelectedCityLabel('');
    setCountryIsOther(false);
    setStateIsOther(false);
    setCityIsOther(false);
    setStates([]);
    setCities([]);
  };

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
    setPickerVisible(false);
    setPickerType('country');
    setPickerLoading(false);
    resetLocationSelection();
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (error) setError('');
  };

  const openPicker = async (type) => {
    setError('');
    setPickerType(type);
    setPickerVisible(true);

    if (type === 'state' && selectedCountryId && !countryIsOther) {
      setPickerLoading(true);
      try {
        const data = await GetState(selectedCountryId);
        setStates(Array.isArray(data) ? data : []);
      } finally {
        setPickerLoading(false);
      }
      return;
    }

    if (type === 'city' && selectedCountryId && selectedStateId && !countryIsOther && !stateIsOther) {
      setPickerLoading(true);
      try {
        const data = await GetCity(selectedCountryId, selectedStateId);
        setCities(Array.isArray(data) ? data : []);
      } finally {
        setPickerLoading(false);
      }
      return;
    }

    setPickerLoading(false);
  };

  const handleCountrySelect = (item) => {
    setPickerVisible(false);
    setSelectedCountryId(item.isOther ? null : item.id);
    setSelectedCountryLabel(item.name);
    setCountryIsOther(Boolean(item.isOther));
    setSelectedStateId(null);
    setSelectedStateLabel('');
    setSelectedCityLabel('');
    setStateIsOther(false);
    setCityIsOther(false);
    setStates([]);
    setCities([]);
    setFormData((prev) => ({
      ...prev,
      country: item.isOther ? '' : item.name,
      state: '',
      city: '',
    }));
  };

  const handleStateSelect = (item) => {
    setPickerVisible(false);
    setSelectedStateId(item.isOther ? null : item.id);
    setSelectedStateLabel(item.name);
    setStateIsOther(Boolean(item.isOther));
    setSelectedCityLabel('');
    setCityIsOther(false);
    setCities([]);
    setFormData((prev) => ({
      ...prev,
      state: item.isOther ? '' : item.name,
      city: '',
    }));
  };

  const handleCitySelect = (item) => {
    setPickerVisible(false);
    setSelectedCityLabel(item.name);
    setCityIsOther(Boolean(item.isOther));
    setFormData((prev) => ({
      ...prev,
      city: item.isOther ? '' : item.name,
    }));
  };

  const getPickerTitle = () => {
    if (pickerType === 'country') return 'Country';
    if (pickerType === 'state') return 'State';
    return 'City';
  };

  const getPickerOptions = () => {
    if (pickerType === 'country') {
      return [...countries, OTHER_OPTION];
    }

    if (pickerType === 'state') {
      if (countryIsOther || !selectedCountryId) {
        return [OTHER_OPTION];
      }
      return [...states, OTHER_OPTION];
    }

    if (stateIsOther || countryIsOther || !selectedStateId) {
      return [OTHER_OPTION];
    }

    return [...cities, OTHER_OPTION];
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
        if (!selectedCountryLabel || !selectedStateLabel || !selectedCityLabel) {
          setError('Please choose your country, state, and city.');
          return false;
        }

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

  const showBackIcon = (isSignup && signupStep > 1) || (isForgot && forgotStep > 1);
  const showCloseIcon = isSignup || isForgot;

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

      <SelectionModal
        visible={pickerVisible}
        title={getPickerTitle()}
        options={getPickerOptions()}
        loading={pickerLoading}
        onClose={() => setPickerVisible(false)}
        onSelect={
          pickerType === 'country'
            ? handleCountrySelect
            : pickerType === 'state'
              ? handleStateSelect
              : handleCitySelect
        }
      />

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
              {showBackIcon ? (
                <ArrowLeft size={18} color={T.ink3} />
              ) : (
                <X size={18} color={T.ink3} />
              )}
            </TouchableOpacity>

            {isSignup && <StepBar current={signupStep} total={5} />}
            {isForgot && <StepBar current={forgotStep} total={3} />}
            {isLogin && <View style={styles.stepSpacer} />}

            <TouchableOpacity
              onPress={onClose}
              style={[styles.headerBtn, !showCloseIcon && styles.headerBtnHidden]}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              disabled={!showCloseIcon}
            >
              {showCloseIcon ? <X size={18} color={T.ink3} /> : null}
            </TouchableOpacity>
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
            <LoginFlow
              isLogin={isLogin}
              isForgot={isForgot}
              forgotStep={forgotStep}
              forgotQuestion={forgotQuestion}
              formData={formData}
              error={error}
              isSubmitting={isSubmitting}
              showPassword={showPassword}
              showNewPassword={showNewPassword}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              switchToForgot={switchToForgot}
              switchToSignup={switchToSignup}
              switchToLogin={switchToLogin}
              LabelledInput={LabelledInput}
              styles={styles}
              T={T}
              setShowPassword={setShowPassword}
              setShowNewPassword={setShowNewPassword}
            />
            <SignupFlow
              isSignup={isSignup}
              signupStep={signupStep}
              formData={formData}
              isSubmitting={isSubmitting}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              switchToLogin={switchToLogin}
              LabelledInput={LabelledInput}
              OptionCard={OptionCard}
              SelectionField={SelectionField}
              styles={styles}
              T={T}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              selectedCountryLabel={selectedCountryLabel}
              selectedStateLabel={selectedStateLabel}
              selectedCityLabel={selectedCityLabel}
              countryIsOther={countryIsOther}
              stateIsOther={stateIsOther}
              cityIsOther={cityIsOther}
              pickerLoading={pickerLoading}
              pickerType={pickerType}
              openPicker={openPicker}
            />
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(10,22,40,0.55)',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  modalCard: {
    maxHeight: '72%',
    backgroundColor: T.white,
    borderRadius: 24,
    padding: 18,
    gap: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: T.ink,
  },
  modalClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: T.surface,
  },
  modalSearchWrap: {
    height: 48,
    borderRadius: 14,
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: T.surface2,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 14,
    color: T.ink,
  },
  modalLoaderWrap: {
    paddingVertical: 36,
    alignItems: 'center',
  },
  modalOption: {
    paddingHorizontal: 8,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eef2ff',
  },
  modalOptionText: {
    fontSize: 15,
    color: T.ink,
  },
  modalOtherText: {
    color: T.blueMain,
    fontWeight: '700',
  },
  modalEmptyWrap: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  modalEmptyText: {
    fontSize: 13,
    color: T.ink3,
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
  headerBtnHidden: {
    opacity: 0,
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
  selectField: {
    height: 52,
    borderRadius: 14,
    backgroundColor: T.surface,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectFieldDisabled: {
    opacity: 0.55,
  },
  selectText: {
    flex: 1,
    fontSize: 15,
    color: T.ink,
    marginRight: 10,
  },
  selectPlaceholder: {
    color: T.ink3,
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
