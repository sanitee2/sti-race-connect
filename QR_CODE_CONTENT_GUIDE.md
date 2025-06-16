# QR Code Content Guide for Race Management System

## 🏷️ **QR Code Content Options**

The system supports multiple formats for QR code content to provide flexibility in implementation:

### **Option 1: Participant ID (Recommended)**
**Content:** `"507f1f77bcf86cd799439011"`

**Example Usage:**
```javascript
// When generating QR code after participant registration
const qrCodeContent = participant.id;
```

**Pros:**
- ✅ Direct database reference to `participants` table
- ✅ Most efficient lookup (single query)
- ✅ Unique per event registration
- ✅ Handles multiple event registrations for same user
- ✅ Event-specific identification

**Cons:**
- ❌ Requires generating QR codes after registration
- ❌ Not human-readable
- ❌ QR codes are event-specific (not reusable)

### **Option 2: User ID**
**Content:** `"507f1f77bcf86cd799439012"`

**Example Usage:**
```javascript
// Using user's main ID
const qrCodeContent = user.id;
```

**Pros:**
- ✅ Consistent across all events for same person
- ✅ Can generate QR codes once per user (reusable)
- ✅ Works across multiple event registrations
- ✅ Simpler QR code generation workflow

**Cons:**
- ❌ Need additional logic to find correct participant record
- ❌ Must verify user is registered for current category
- ❌ Less direct database lookup

### **Option 3: RFID/Bib Number**
**Content:** `"BIB001234"` or `"RFID-789123"`

**Example Usage:**
```javascript
// Using RFID or bib number
const qrCodeContent = participant.rfid_number;
```

**Pros:**
- ✅ Human-readable and verifiable
- ✅ Traditional race numbering system
- ✅ Easy to cross-reference manually
- ✅ Can be printed on race bibs

**Cons:**
- ❌ Requires populating `rfid_number` field
- ❌ Manual assignment process
- ❌ Potential for duplicates if not managed properly

### **Option 4: Structured JSON (Advanced)**
**Content:**
```json
{
  "participantId": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "eventId": "507f1f77bcf86cd799439013",
  "categoryId": "507f1f77bcf86cd799439014",
  "bibNumber": "BIB001234",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Example Usage:**
```javascript
// Structured data with multiple identifiers
const qrCodeContent = JSON.stringify({
  participantId: participant.id,
  userId: participant.user_id,
  eventId: participant.event_id,
  categoryId: participant.category_id,
  bibNumber: participant.rfid_number,
  timestamp: new Date().toISOString()
});
```

**Pros:**
- ✅ Multiple identifiers for redundancy
- ✅ Can include additional metadata
- ✅ Most flexible and future-proof
- ✅ Self-validating (includes event/category info)
- ✅ Debugging information included

**Cons:**
- ❌ Larger QR codes (may affect scanning)
- ❌ More complex parsing logic
- ❌ Increased bandwidth for mobile scanning

## 🎯 **Recommended Implementation**

### **For Production Use: Participant ID**
```javascript
// Simple, efficient approach
const qrCodeContent = participant.id;
```

### **For Advanced Use: Structured JSON**
```javascript
// When you need additional validation/metadata
const qrCodeContent = JSON.stringify({
  participantId: participant.id,
  userId: participant.user_id,
  eventId: participant.event_id,
  categoryId: participant.category_id,
  version: "1.0"
});
```

## 📱 **QR Code Generation Examples**

### **Simple Participant ID QR Code**
```javascript
// API endpoint: POST /api/participants/generate-qr
{
  "participantId": "507f1f77bcf86cd799439011"
}

// Response:
{
  "success": true,
  "qrCode": {
    "dataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "content": "507f1f77bcf86cd799439011",
    "participant": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "event": "City Marathon 2024",
      "category": "10K Race"
    }
  }
}
```

### **Structured JSON QR Code**
```javascript
// More detailed QR content
const qrContent = {
  "p": "507f1f77bcf86cd799439011", // participantId (shortened keys)
  "u": "507f1f77bcf86cd799439012", // userId
  "e": "507f1f77bcf86cd799439013", // eventId
  "c": "507f1f77bcf86cd799439014", // categoryId
  "t": 1705312200000              // timestamp
};
```

## 🔍 **Scanner Implementation**

The current scanner supports all formats:

```typescript
// In handleScanResult function
const parseQRCode = (data: string) => {
  let participantId = data;
  let parsedData = null;
  
  // Try JSON parsing first
  try {
    parsedData = JSON.parse(data);
    if (parsedData.participantId || parsedData.p) {
      participantId = parsedData.participantId || parsedData.p;
    } else if (parsedData.userId || parsedData.u) {
      participantId = parsedData.userId || parsedData.u;
    }
  } catch {
    // Simple string format
    participantId = data.trim();
  }
  
  // Find participant using multiple identifiers
  const participant = participants.find(p => 
    p.id === participantId || 
    p.userId === participantId || 
    p.rfidNumber === participantId
  );
  
  return participant;
};
```

## 📋 **Database Schema Reference**

```sql
-- Participants table fields available for QR identification
participants {
  id: String (ObjectId)           -- Primary identifier
  user_id: String (ObjectId)      -- User reference
  rfid_number: String (Optional)  -- Custom identifier
  event_id: String (ObjectId)     -- Event reference
  category_id: String (ObjectId)  -- Category reference
}
```

## 🚀 **Best Practices**

1. **For Small Events (<100 participants)**: Use Participant ID
2. **For Large Events (>100 participants)**: Use Structured JSON with shortened keys
3. **For Multi-Event Systems**: Use User ID with event validation
4. **For Traditional Racing**: Use RFID/Bib numbers with Participant ID backup

## 🔧 **Testing QR Codes**

You can test different QR code formats:

1. **Simple ID**: `"507f1f77bcf86cd799439011"`
2. **JSON**: `{"participantId":"507f1f77bcf86cd799439011","userId":"507f1f77bcf86cd799439012"}`
3. **RFID**: `"BIB001234"`

The scanner will automatically detect and parse the format! 🎯 