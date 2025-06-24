import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native";
import { useUser, useAuth } from "@clerk/clerk-expo";
import * as ImagePicker from "expo-image-picker";
import { authStyles } from "../../assets/styles/auth.styles";
import { COLORS } from "../../constants/colors";

const ProfileScreen = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [username, setUsername] = useState(user?.username || "");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle profile image update
  const handleImagePick = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow access to your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setLoading(true);
      try {
        await user.setProfileImage({ file: { uri: result.assets[0].uri, name: "profile.jpg", type: "image/jpeg" } });
        Alert.alert("Success", "Profile image updated!");
      } catch (err) {
        Alert.alert("Error", "Could not update profile image.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle user info update
  const handleSave = async () => {
    setLoading(true);
    try {
      await user.update({
        firstName,
        lastName,
        username,
      });
      setEditing(false);
      Alert.alert("Success", "Profile updated!");
    } catch (err) {
      Alert.alert("Error", "Could not update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={authStyles.container}>
      <View style={{ alignItems: "center", marginVertical: 24 }}>
        <TouchableOpacity onPress={handleImagePick} disabled={loading}>
          <Image
            source={{ uri: user?.imageUrl }}
            style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.background }}
          />
          <Text style={{ color: COLORS.primary, marginTop: 8 }}>Edit Photo</Text>
        </TouchableOpacity>
      </View>

      <View style={authStyles.formContainer}>
        <Text style={authStyles.title}>Profile</Text>
        <TextInput
          style={authStyles.textInput}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First Name"
          editable={editing}
        />
        <TextInput
          style={authStyles.textInput}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last Name"
          editable={editing}
        />
        <TextInput
          style={authStyles.textInput}
          value={username}
          onChangeText={setUsername}
          placeholder="Username"
          editable={editing}
        />
        <TextInput
          style={authStyles.textInput}
          value={user?.emailAddresses[0]?.emailAddress}
          editable={false}
          placeholder="Email"
        />

        {editing ? (
          <TouchableOpacity style={authStyles.authButton} onPress={handleSave} disabled={loading}>
            <Text style={authStyles.buttonText}>{loading ? "Saving..." : "Save"}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={authStyles.authButton} onPress={() => setEditing(true)}>
            <Text style={authStyles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={authStyles.linkContainer} onPress={signOut}>
          <Text style={authStyles.linkText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileScreen;