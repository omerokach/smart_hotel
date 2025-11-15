# 🚀 Setup Guide - Smart Hotel AI Concierge

## Step-by-Step Setup (From Zero to Running)

### Step 1: Install Node.js (if not installed)

Check if you have Node.js installed:
```bash
node --version
```

If not installed, download from: https://nodejs.org/ (version 18 or higher)

### Step 2: Get Your OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)
5. **Important**: Save it securely - you won't be able to see it again!

### Step 3: Set Up the Project

```bash
# Navigate to the project directory
cd smartHotel

# Install all dependencies
npm install
```

This will install:
- `@openai/agents` - The OpenAI Agents SDK
- `zod` - Schema validation
- `express` - Web server
- `typescript` - TypeScript compiler
- And other necessary packages

### Step 4: Configure Your API Key

**Option A: Environment Variable (Recommended)**
```bash
export OPENAI_API_KEY=sk-your-actual-key-here
```

**Option B: Create .env file**
```bash
# Create .env file in the project root
echo "OPENAI_API_KEY=sk-your-actual-key-here" > .env
```

Replace `sk-your-actual-key-here` with your actual API key.

### Step 5: Run the Application

Choose one of these options:

#### 🌐 Web Interface (Best for demos)
```bash
npm run web
```
Then open: http://localhost:3000

#### 💻 CLI Chat (Best for testing)
```bash
npm run chat
```
Type your messages directly in the terminal.

#### ⚡ Quick Demo
```bash
npm run dev
```
Runs a single example interaction.

## 🎯 Testing Your Setup

Once running, try these test messages:

1. **Room Service Test**:
   ```
   "Hi, I want to order room service. I'm in room 305 and I'd like a burger and fries."
   ```

2. **Housekeeping Test**:
   ```
   "Can someone clean my room? I'm in 412 and need a full cleaning."
   ```

3. **Towels Test**:
   ```
   "I need 4 bath towels delivered to room 208."
   ```

4. **Spa Test**:
   ```
   "I want to book a massage for tomorrow at 3 PM. I'm in room 501."
   ```

## ✅ Verification Checklist

- [ ] Node.js 18+ installed
- [ ] All npm packages installed successfully
- [ ] OpenAI API key obtained
- [ ] API key configured (environment variable or .env)
- [ ] Application starts without errors
- [ ] Can send messages and receive responses

## 🐛 Common Issues

### Issue: "Cannot find module '@openai/agents'"
**Solution**: Run `npm install` again

### Issue: "Error: OPENAI_API_KEY is not set"
**Solution**: 
```bash
export OPENAI_API_KEY=sk-your-key-here
# or create a .env file
```

### Issue: "Port 3000 is already in use"
**Solution**: Use a different port:
```bash
PORT=3001 npm run web
```

### Issue: "Invalid API key"
**Solution**: 
1. Check your API key is correct
2. Verify it starts with `sk-`
3. Make sure there are no extra spaces
4. Generate a new key if needed

### Issue: TypeScript errors
**Solution**: 
```bash
npm install --save-dev typescript tsx @types/node
```

## 🎓 Next Steps

Once your setup is working:

1. **Customize the agent**: Edit `src/agent.ts` to change behavior
2. **Add new services**: Create new tools in `src/tools/`
3. **Modify the UI**: Edit `public/index.html` for the web interface
4. **Integrate with systems**: Connect tools to real hotel management systems

## 📞 Need Help?

- Read the full [README.md](./README.md)
- Check [OpenAI Agents SDK Docs](https://openai.github.io/openai-agents-js)
- Review the example code in `src/` directory

---

Ready to build? Start with: `npm run web` 🚀

