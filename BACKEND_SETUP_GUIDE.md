# Backend Configuration - What Your API Should Do

## POST Endpoint Setup

### Endpoint Details

- **Method**: POST
- **Route**: `/api/user/profile`
- **Content-Type**: `application/json`

---

## Request Body (What You'll Receive)

```json
{
  "fullName": "John Doe",
  "birthDate": "1995-05-15",
  "gender": "Female",
  "faceShape": "Oval",
  "bodyType": "Athletic",
  "occasions": ["Party & Clubwear", "Work Formal"],
  "favoriteColors": [
    {
      "name": "Navy",
      "hexCode": "#001F3F"
    },
    {
      "name": "Custom Purple",
      "hexCode": "#8B008B"
    }
  ],
  "email": "john@example.com"
}
```

---

## Response Format (What You Should Return)

### Success Response (Status: 200)

```json
{
  "success": true,
  "userId": 12345,
  "message": "Profile created successfully"
}
```

### Error Response (Status: 400 or 500)

```json
{
  "success": false,
  "message": "Email already exists"
}
```

---

## Database Schema Example

Create a `users` table with:

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  fullName VARCHAR(255) NOT NULL,
  birthDate DATE NOT NULL,
  gender VARCHAR(50),
  faceShape VARCHAR(50),
  bodyType VARCHAR(50),
  email VARCHAR(255) UNIQUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user_occasions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  occasion VARCHAR(255) NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE user_favorite_colors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  colorName VARCHAR(255) NOT NULL,
  hexCode VARCHAR(7) NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## Sample Backend Implementation (Java Spring Boot)

```java
@RestController
@RequestMapping("/api/user")
public class UserController {

  @Autowired
  private UserService userService;

  @PostMapping("/profile")
  public ResponseEntity<?> createProfile(@RequestBody UserProfileRequest request) {
    try {
      // Validate input
      if (request.getFullName() == null || request.getFullName().isEmpty()) {
        return ResponseEntity.badRequest()
          .body(new ErrorResponse("Full name is required"));
      }

      // Create user
      User user = userService.createUser(
        request.getFullName(),
        request.getBirthDate(),
        request.getGender(),
        request.getFaceShape(),
        request.getBodyType(),
        request.getEmail()
      );

      // Save occasions
      for (String occasion : request.getOccasions()) {
        userService.addOccasion(user.getId(), occasion);
      }

      // Save favorite colors
      for (ColorRequest color : request.getFavoriteColors()) {
        userService.addFavoriteColor(user.getId(), color.getName(), color.getHexCode());
      }

      // Return response with userId
      return ResponseEntity.ok(new SuccessResponse(
        true,
        user.getId(),
        "Profile created successfully"
      ));

    } catch (Exception e) {
      return ResponseEntity.status(500)
        .body(new ErrorResponse(e.getMessage()));
    }
  }
}
```

---

## Sample Backend Implementation (Node.js Express)

```javascript
const express = require("express");
const router = express.Router();
const db = require("./database");

router.post("/profile", async (req, res) => {
  try {
    const {
      fullName,
      birthDate,
      gender,
      faceShape,
      bodyType,
      occasions,
      favoriteColors,
      email,
    } = req.body;

    // Validate
    if (!fullName || !birthDate) {
      return res.status(400).json({
        success: false,
        message: "Full name and birth date are required",
      });
    }

    // Insert user
    const userResult = await db.query(
      "INSERT INTO users (fullName, birthDate, gender, faceShape, bodyType, email) VALUES (?, ?, ?, ?, ?, ?)",
      [fullName, birthDate, gender, faceShape, bodyType, email],
    );

    const userId = userResult.insertId;

    // Insert occasions
    for (const occasion of occasions) {
      await db.query(
        "INSERT INTO user_occasions (userId, occasion) VALUES (?, ?)",
        [userId, occasion],
      );
    }

    // Insert favorite colors
    for (const color of favoriteColors) {
      await db.query(
        "INSERT INTO user_favorite_colors (userId, colorName, hexCode) VALUES (?, ?, ?)",
        [userId, color.name, color.hexCode],
      );
    }

    res.json({
      success: true,
      userId: userId,
      message: "Profile created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error creating profile",
    });
  }
});

module.exports = router;
```

---

## Frontend Configuration

Update `lib/profileAPI.ts`:

```typescript
// Replace with your actual backend URL
const BASE_URL = "http://your-backend-server:8080"; // Example: http://192.168.1.100:8080
```

### Examples by Environment:

- **Development (Local)**: `http://localhost:8080`
- **Staging**: `https://api-staging.yourdomain.com`
- **Production**: `https://api.yourdomain.com`

---

## Testing the Integration

Use a tool like **Postman** or **cURL** to test:

```bash
curl -X POST http://localhost:8080/api/user/profile \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "birthDate": "1995-05-15",
    "gender": "Female",
    "faceShape": "Oval",
    "bodyType": "Athletic",
    "occasions": ["Party & Clubwear", "Work Formal"],
    "favoriteColors": [
      {"name": "Navy", "hexCode": "#001F3F"},
      {"name": "Blue", "hexCode": "#0074D9"}
    ],
    "email": "john@example.com"
  }'
```

Expected Response:

```json
{
  "success": true,
  "userId": 1,
  "message": "Profile created successfully"
}
```

---

## Troubleshooting

| Issue              | Solution                                           |
| ------------------ | -------------------------------------------------- |
| 404 Not Found      | Check endpoint path matches `/api/user/profile`    |
| 400 Bad Request    | Validate all required fields are present           |
| CORS Error         | Add CORS headers to allow requests from frontend   |
| Connection Refused | Check backend URL is correct and server is running |
| 500 Server Error   | Check backend logs for database/validation errors  |

---

That's everything you need to set up the backend! Let me know if you need help with your specific backend technology.
