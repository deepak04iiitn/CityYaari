import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const T = {
  surface: "#ffffff",
  surfaceAlt: "#f8f6f2",
  ink: "#0a0a0a",
  soft: "#888888",
  line: "#e0dbd4",
  lineLight: "#ece7e0",
  coral: "#C05A5A",
  coralPale: "#FAEAEA",
  blue: "#004ac6",
  bluePale: "#eef2ff",
  blueLight: "#c7d8ff",
  white: "#ffffff",
};

export default function UserActionsMenu({ visible, onClose, onBlock, onReport }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={st.overlay} onPress={onClose}>
        <View style={st.menuCard}>
          <View style={st.menuHandle} />

          <Pressable
            onPress={() => { onClose(); onBlock(); }}
            style={({ pressed }) => [st.menuRow, pressed && st.menuRowPressed]}
          >
            <View style={[st.menuIcon, st.menuIconDanger]}>
              <MaterialIcons name="block" size={18} color={T.coral} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[st.menuLabel, { color: T.coral }]}>Block User</Text>
              <Text style={st.menuSub}>They won't be able to find or message you</Text>
            </View>
            <MaterialIcons name="chevron-right" size={18} color={T.coral} />
          </Pressable>

          <View style={st.menuDivider} />

          <Pressable
            onPress={() => { onClose(); onReport(); }}
            style={({ pressed }) => [st.menuRow, pressed && st.menuRowPressed]}
          >
            <View style={[st.menuIcon, st.menuIconWarn]}>
              <MaterialIcons name="flag" size={18} color="#d97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={st.menuLabel}>Report User</Text>
              <Text style={st.menuSub}>Let us know what's wrong</Text>
            </View>
            <MaterialIcons name="chevron-right" size={18} color={T.soft} />
          </Pressable>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [st.cancelBtn, pressed && { opacity: 0.75 }]}
          >
            <Text style={st.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const st = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10, 10, 10, 0.45)",
    justifyContent: "flex-end",
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  menuCard: {
    backgroundColor: T.surface,
    borderRadius: 22,
    paddingTop: 8,
    paddingBottom: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: T.lineLight,
  },
  menuHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: T.line,
    alignSelf: "center",
    marginBottom: 10,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  menuRowPressed: {
    backgroundColor: T.surfaceAlt,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuIconDanger: {
    backgroundColor: T.coralPale,
    borderWidth: 1,
    borderColor: "#f1c0c0",
  },
  menuIconWarn: {
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: T.ink,
  },
  menuSub: {
    fontSize: 12,
    color: T.soft,
    fontWeight: "500",
    marginTop: 1,
  },
  menuDivider: {
    height: 1,
    backgroundColor: T.lineLight,
    marginHorizontal: 18,
  },
  cancelBtn: {
    marginTop: 6,
    marginHorizontal: 14,
    marginBottom: 8,
    height: 48,
    borderRadius: 14,
    backgroundColor: T.surfaceAlt,
    borderWidth: 1.5,
    borderColor: T.line,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "800",
    color: T.ink,
  },
});
