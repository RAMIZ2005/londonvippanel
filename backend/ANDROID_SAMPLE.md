# Android Integration Guide

## 1. Request Implementation (OkHttp)

Use `OkHttp` or `Retrofit` to make the request.

```java
import okhttp3.*;
import org.json.JSONObject;

public class LicenseManager {
    private static final String API_URL = "http://your-vps-ip:3000/api/v1/check";

    public interface LicenseCallback {
        void onSuccess(boolean isValid, String message);
        void onError(String error);
    }

    public void checkLicense(String licenseKey, String deviceFingerprint, LicenseCallback callback) {
        OkHttpClient client = new OkHttpClient();

        JSONObject json = new JSONObject();
        try {
            json.put("license_key", licenseKey);
            json.put("device_fingerprint", deviceFingerprint);
        } catch (Exception e) {
            callback.onError(e.getMessage());
            return;
        }

        RequestBody body = RequestBody.create(
                json.toString(), MediaType.get("application/json; charset=utf-8"));

        Request request = new Request.Builder()
                .url(API_URL)
                .post(body)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                callback.onError("Network Error: " + e.getMessage());
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (!response.isSuccessful()) {
                    callback.onError("Server Error: " + response.code());
                    return;
                }

                try {
                    // The server returns a JWT string (signed response)
                    // Format: "eyJhbGciOi..."
                    String jwtToken = response.body().string().replace("\"", "");

                    // Decode JWT (Use a library like java-jwt or simply decode Base64 for payload if verify is skipped)
                    // For security, you should verify the signature using the shared secret or public key.
                    // Here is a simple Base64 decode of the payload (middle part):
                    
                    String[] parts = jwtToken.split("\\.");
                    String payloadJson = new String(java.util.Base64.getUrlDecoder().decode(parts[1]));
                    
                    JSONObject payload = new JSONObject(payloadJson);
                    boolean valid = payload.optBoolean("valid", false);
                    String message = payload.optString("message", "Unknown");

                    callback.onSuccess(valid, message);

                } catch (Exception e) {
                    callback.onError("Parsing Error: " + e.getMessage());
                }
            }
        });
    }
}
```

## 2. Device Fingerprint Generation

Do NOT use `Settings.Secure.ANDROID_ID` directly as it can be spoofed. Hash it.

```java
import java.security.MessageDigest;
import android.provider.Settings;
import android.content.Context;

public static String getDeviceFingerprint(Context context) {
    try {
        String androidId = Settings.Secure.getString(context.getContentResolver(), Settings.Secure.ANDROID_ID);
        // Combine with other hardware identifiers if needed for more uniqueness
        String rawId = androidId + android.os.Build.BOARD + android.os.Build.BRAND;
        
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(rawId.getBytes("UTF-8"));
        
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    } catch (Exception e) {
        return "unknown_device";
    }
}
```
