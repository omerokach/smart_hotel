# 📝 Usage Examples - Smart Hotel AI Concierge

This document provides real-world examples of how guests can interact with the AI concierge.

## 🍽️ Room Service Examples

### Basic Order
```
Guest: "I want to order room service"
Agent: "I'd be happy to help you with room service! May I have your room number, 
        and what would you like to order?"

Guest: "Room 305. I want a cheeseburger, fries, and a coke"
Agent: "Perfect! I've placed your order for room 305:
        - Cheeseburger
        - Fries
        - Coca Cola
        
        Estimated delivery time: 25-35 minutes. Is there anything else I can help you with?"
```

### Order with Special Instructions
```
Guest: "Can I get breakfast delivered to 412? I want pancakes and orange juice, 
        but I'm allergic to nuts"
Agent: "Certainly! I'll place that order right away with a note about your nut allergy.
        
        Order for room 412:
        - Pancakes
        - Orange juice
        Special instructions: No nuts (allergy)
        
        Estimated delivery: 20-30 minutes."
```

### Multiple Items
```
Guest: "Hi, room 208 here. I need coffee, two croissants, scrambled eggs, 
        bacon, and fresh fruit"
Agent: "Excellent choice! I've placed your breakfast order for room 208:
        - Coffee
        - Two croissants
        - Scrambled eggs
        - Bacon
        - Fresh fruit
        
        Estimated delivery: 30-40 minutes."
```

## 🧹 Housekeeping Examples

### Quick Room Tidy
```
Guest: "Can someone tidy up my room quickly? I have guests coming in an hour. Room 501"
Agent: "Of course! I'll arrange a quick-tidy service for room 501 right away.
        
        Request ID: HK-1234567890-ABC123DEF
        Service: Quick tidy
        Time: As soon as possible
        
        Our housekeeping team will be there shortly!"
```

### Full Cleaning with Timing
```
Guest: "I need my room fully cleaned. I'm in 306 and will be out from 2-5 PM"
Agent: "Perfect timing! I'll schedule a full cleaning for room 306 between 2-5 PM.
        
        Request ID: HK-1234567891-XYZ789GHI
        Service: Full clean
        Preferred time: 2:00 PM - 5:00 PM
        
        Your room will be spotless when you return!"
```

### Turndown Service
```
Guest: "I'd like turndown service for tonight in room 701"
Agent: "I'll arrange that for you right away!
        
        Request ID: HK-1234567892-LMN456OPQ
        Service: Turndown service
        Time: This evening
        
        We'll prepare your room for a comfortable night."
```

## 🛁 Towel Request Examples

### Basic Towel Request
```
Guest: "I need more towels in room 208"
Agent: "I'd be happy to bring you more towels! How many would you like, 
        and what type? We have bath towels, hand towels, pool towels, 
        or I can bring an assortment."

Guest: "4 bath towels please"
Agent: "Perfect! I'll have 4 bath towels delivered to room 208 right away.
        
        Request ID: TWL-1234567893-RST123UVW
        Quantity: 4
        Type: Bath towels
        
        They should arrive within 15 minutes."
```

### Specific Towel Types
```
Guest: "Can I get 2 pool towels and 3 hand towels for room 555?"
Agent: "Absolutely! I'm sending:
        - 2 pool towels
        - 3 hand towels
        to room 555
        
        Request ID: TWL-1234567894-BCD456EFG
        
        They'll be delivered shortly!"
```

### Urgent Request
```
Guest: "Room 309 - I spilled something and need towels immediately"
Agent: "I'll send towels to room 309 right away! How many do you need?"

Guest: "3 or 4 should be fine"
Agent: "I'm dispatching 4 towels to room 309 immediately.
        
        Request ID: TWL-1234567895-HIJ789KLM
        
        They should be there in just a few minutes!"
```

## 💆 Spa Booking Examples

### Massage Booking
```
Guest: "I want to book a massage"
Agent: "Wonderful! I'd be happy to help you book a spa treatment. 
        May I have your room number and when you'd like to schedule it?"

Guest: "Room 801, tomorrow afternoon around 3 PM"
Agent: "Perfect! I've booked a massage for you:
        
        Room: 801
        Treatment: Massage
        Time: Tomorrow at 3:00 PM
        Duration: 60 minutes
        Confirmation code: SPA-ABC123XYZ
        
        Please arrive 10 minutes early to check in. Enjoy your treatment!"
```

### Specific Treatment Request
```
Guest: "I'd like to book a deep tissue massage for 2 PM today. I'm in room 615"
Agent: "Excellent choice! I've scheduled your deep tissue massage:
        
        Room: 615
        Treatment: Deep tissue massage
        Time: Today at 2:00 PM
        Duration: 60 minutes
        Confirmation code: SPA-DEF456UVW
        
        Looking forward to helping you relax!"
```

### Multiple Treatments
```
Guest: "Can I book a facial and manicure for tomorrow morning? Room 404"
Agent: "I'd be happy to help! Would you like these scheduled back-to-back, 
        or at different times?"

Guest: "Back to back please, starting at 10 AM"
Agent: "Perfect! I'll book both treatments starting at 10 AM. Let me schedule 
        the facial first, and then I can book the manicure to follow."
        
[Books both treatments sequentially]
```

### Couple's Treatment
```
Guest: "My partner and I want couple's massages tomorrow evening. Room 1001"
Agent: "How romantic! What time would work best for you tomorrow evening?"

Guest: "6 PM would be perfect"
Agent: "I've scheduled a massage for room 1001 at 6:00 PM tomorrow:
        
        Treatment: Massage (for two guests)
        Time: Tomorrow at 6:00 PM
        Duration: 60 minutes
        Confirmation code: SPA-GHI789RST
        
        Please note: You may want to call the spa directly at extension 7777 
        to confirm arrangements for a couple's treatment setup."
```

## 🎯 Multi-Service Requests

### Combined Requests
```
Guest: "Hi, I'm in room 505 and I need several things"
Agent: "Of course! I'm here to help. What do you need?"

Guest: "I want room service - a Caesar salad and iced tea. 
        Also need 2 bath towels and want to book a massage for this afternoon"
Agent: [Processes all three requests using multiple tools]
        "I've taken care of everything for room 505!
        
        Room Service Order:
        - Caesar salad
        - Iced tea
        Delivery: 25-35 minutes
        
        Towels:
        - 2 bath towels
        Request ID: TWL-1234567896-MNO012PQR
        Delivery: Within 15 minutes
        
        Spa Appointment:
        - Massage
        - This afternoon
        What time this afternoon works best for you?"
```

### Sequential Clarification
```
Guest: "I need help with a few things in my room"
Agent: "I'd be happy to help! What do you need assistance with?"

Guest: "First, I want to order lunch"
Agent: "Great! What room number, and what would you like to order?"

Guest: "Room 333. A club sandwich and fries"
Agent: [Processes room service]
        "Your lunch is ordered! What else can I help you with?"

Guest: "Also need housekeeping"
Agent: "What type of service would you like? Full-clean, quick-tidy, or turndown?"

Guest: "Full clean while I'm at lunch please"
Agent: [Schedules housekeeping]
        "Perfect! I'll schedule that now. Anything else?"
```

## 🗣️ Natural Language Variations

The AI understands many ways to ask for the same thing:

### Room Service Variations
- "I want to order food"
- "Can I get room service?"
- "I'm hungry, what can I order?"
- "Deliver a burger to my room"
- "I'd like to order dinner"
- "Send food to room 405"

### Housekeeping Variations
- "Can someone clean my room?"
- "I need housekeeping"
- "My room needs to be tidied"
- "Send someone to clean up"
- "Schedule a cleaning"

### Towel Variations
- "I need more towels"
- "Can I get extra towels?"
- "Send towels to my room"
- "We're out of towels"
- "Bring me some towels"

### Spa Variations
- "I want a massage"
- "Book a spa appointment"
- "Schedule a treatment"
- "I'd like a facial"
- "Reserve a spa time"

## 💡 Tips for Best Results

1. **Include your room number** - The agent always needs this
2. **Be specific** - "2 bath towels" is better than "some towels"
3. **Mention timing** - "this afternoon" or "in 30 minutes"
4. **Special needs** - Always mention allergies or special requirements
5. **Ask follow-ups** - The agent maintains context throughout the conversation

## 🚫 What the Agent Can't Do (Yet)

- Check availability of specific restaurant items
- Modify existing orders
- Cancel appointments
- Check account charges
- Wake-up calls (could be added as a new tool!)
- Room temperature control (could be integrated!)

These features can easily be added by creating new tools!

---

These examples show the flexibility and natural language understanding of the AI concierge. The system handles various phrasings, maintains context, and provides helpful, professional responses.

