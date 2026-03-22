import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  Image,
  ImageBackground,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from "react-native";

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.screen}>
        <View style={styles.hero}>
          <ImageBackground
            source={require("../../assets/welcome_illustration.png")}
            style={styles.heroImage}
            imageStyle={styles.heroImageStyle}
            resizeMode="cover"
          >

            <View style={styles.tagLeft}>
              <MaterialIcons name="location-on" size={14} color="#341100" />
              <Text style={styles.tagLeftText}>FROM JAIPUR</Text>
            </View>

            <View style={styles.tagRight}>
              <MaterialIcons name="explore" size={14} color="#00174B" />
              <Text style={styles.tagRightText}>NOW IN BENGALURU</Text>
            </View>

            <LinearGradient
              colors={["transparent", "rgba(255,255,255,0.7)", "#FFFFFF"]}
              style={styles.bottomFade}
            />
          </ImageBackground>
        </View>

        <View style={styles.content}>
          <View style={styles.headlineBlock}>
            <Image source={require("../../assets/Logo.png")} style={styles.logo} />
            <Text style={styles.headline}>
              Find Your <Text style={styles.headlineAccent}>People</Text> in Every City
            </Text>
            <Text style={styles.subheadline}>
              Connect with people from your hometown, wherever you go.
            </Text>
            <Pressable 
              style={styles.primaryButton}
              onPress={() => navigation.navigate("Onboarding")}
            >
              <Text style={styles.primaryButtonText}>Welcome to CityYaari</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={styles.footer}>

            <View style={styles.socialProof}>
              <View style={styles.avatarRow}>
                <Image
                  source={{
                    uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCs5zGXiZ4HhE0jhZ2bUvLtSzskWgRU4t5b3KCVQOsGEiYhGR2Bk67Z-iphsos429xSn0RcRgx_iLmUr8Z5bZVgQ72g5fOuK1jVA2ZaB3uiiInV6W4jgr-DBVKFs62ee3c4dc09hZdnSePxlK75DmZzr4rcCILEhtycrsm3qc9hEgzXujGGhIAr1rHtACXiXFhcVOkOCwxc8FIrreBnvCtIaRWr6fNTYkJM2H3FeAsQZ3JPfvkk_eVc-8f9fo3XT9b6-fp3bQ16OzQ"
                  }}
                  style={styles.avatar}
                />
                <Image
                  source={{
                    uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5LMYdPkFnqZQzah-N2VfZoXB9BQDVTFj1FSZzHUNCdR6b71mjFH6148Q2dyYRib9Emfw4uqRKIZNPMmT4idG3Ahg_phbeONhmDuWxc7pOWDNNdh7-s85unHpvtU6_Hqa8FMYBJWyT4N-TAH8KCCyGK6oOH3vY2Q1-pUbAtMufE8OXc7w6rcAclYLauwC7xEOUDOkVdpJly8F_YGsGOkw2S4oFcPLqj6rkecEaOpq0oG3dBaT-0p1ZHE0opMQDQ1YGWbsGLIaBh_Y"
                  }}
                  style={styles.avatarOverlap}
                />
                <Image
                  source={{
                    uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuATWy_aYuHv-IDEUsM8yOiqiVZfAj34shIIqt8hz3osjxuQxCfYeR4yMxJTNLnrZPvFhVYDoUNMNIV7AdP8dDDi3YIbHKo2t72c8BEejhsNWwl6tP6LqH9WVtxdHElzq543NexKKHsBQ34arhLdD8MBPbpA_5xKi4PXdE1s3pEZ99MKcBil0F8lquCon8qQP8NNlZOSStFciNaqKo5-XxwRF5weV3293bRQ89tB1tXTxwRrLx8MRVdNAFABOECIbyt_45pQngaX70w"
                  }}
                  style={styles.avatarOverlap}
                />
              </View>
              <Text style={styles.socialProofText}>JOIN 10K+ YAARIS</Text>
            </View>
          </View>
        </View>
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  hero: {
    height: "58%",
    marginTop: -40
  },
  heroImage: {
    flex: 1,
    justifyContent: "space-between"
  },
  heroImageStyle: {
    width: "100%",
    height: "100%"
  },
  logo: {
    width: 150,
    height: 70,
    marginBottom: 30
  },
  tagLeft: {
    position: "absolute",
    left: 24,
    bottom: 50,
    transform: [{ rotate: "-3deg" }],
    backgroundColor: "#FFDBCA",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4
  },
  tagLeftText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: "#341100"
  },
  tagRight: {
    position: "absolute",
    right: 24,
    top: 130,
    transform: [{ rotate: "3deg" }],
    backgroundColor: "#DBE1FF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4
  },
  tagRightText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: "#00174B"
  },
  bottomFade: {
    height: 100,
    width: "100%",
    position: "absolute",
    bottom: 0
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
    justifyContent: "space-between",
    alignItems: "center"
  },
  headlineBlock: {
    width: "100%",
    maxWidth: 340,
    alignItems: "center"
  },
  headline: {
    textAlign: "center",
    fontSize: 30,
    lineHeight: 35,
    fontWeight: "800",
    color: "#191C1E",
    letterSpacing: -0.8,
    marginBottom: 16,
    marginTop: -20
  },
  headlineAccent: {
    color: "#004AC6"
  },
  subheadline: {
    textAlign: "center",
    color: "#434655",
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 20
  },
  footer: {
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    gap: 24
  },
  primaryButton: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    backgroundColor: "#1454D8",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: "#004AC6",
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700"
  },
  socialProof: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#FFFFFF"
  },
  avatarOverlap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    marginLeft: -8
  },
  socialProofText: {
    fontSize: 12,
    letterSpacing: 0.7,
    fontWeight: "700",
    color: "#434655"
  }
});