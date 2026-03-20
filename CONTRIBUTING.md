# Contributing to ReportIt

Thank you for your interest in contributing to ReportIt! This document provides guidelines and instructions for contributing to the project.

## 📋 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on code quality and user experience
- Report security vulnerabilities responsibly
- Avoid discriminatory language

## 🚀 Getting Started

### 1. Fork the Repository

Click the "Fork" button on GitHub to create your own copy.

### 2. Clone Your Fork

```powershell
git clone https://github.com/yourusername/ReportIt.git
cd ReportIt
```

### 3. Add Upstream Remote

```powershell
git remote add upstream https://github.com/original-repo/ReportIt.git
```

### 4. Create Feature Branch

```powershell
git checkout -b feature/your-feature-name
```

Branch naming convention:
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring
- `test/description` - Test additions

## 💻 Development Setup

### Backend Setup

```powershell
cd backend
npm install
```

Create `.env` file with test configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/reportit-dev
JWT_SECRET=test-secret-key
JWT_EXPIRE=7d
EMAIL_SERVICE=gmail
EMAIL_USER=test@gmail.com
EMAIL_PASSWORD=test-password
EMAIL_FROM=noreply@reportit.com
FRONTEND_URL=http://localhost:5173
```

Start in development mode:
```powershell
npm run dev
```

### Frontend Setup

```powershell
cd frontend
npm install
npm run dev
```

## 🎯 Types of Contributions

### 1. Bug Reports

Create an issue with:
- **Title**: Clear description of the bug
- **Description**: Detailed explanation
- **Steps to Reproduce**: How to replicate
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshots**: If applicable
- **Environment**: Browser, OS, etc.

### 2. Feature Requests

Create an issue with:
- **Title**: Clear feature description
- **Motivation**: Why this feature is needed
- **Proposed Solution**: How it should work
- **Alternative Solutions**: Other approaches
- **Additional Context**: Screenshots, examples

### 3. Code Contributions

Follow the guidelines below for submitting code.

### 4. Documentation

Update or add documentation:
- README.md
- API_DOCUMENTATION.md
- Code comments
- JSDoc/inline documentation

## 📐 Coding Guidelines

### General Principles

- **Keep it simple**: Write clear, maintainable code
- **DRY**: Don't Repeat Yourself
- **SOLID**: Follow SOLID principles
- **Performance**: Write efficient code
- **Security**: Validate inputs, protect data

### JavaScript/Node.js Style

```javascript
// Use const by default, let for variables that change
const userName = "John";
let counter = 0;

// Use meaningful variable names
const calculateUserAge = (birthYear) => {
  return new Date().getFullYear() - birthYear;
};

// Use template literals
const message = `User ${userName} is ${age} years old`;

// Use arrow functions for callbacks
array.map(item => item * 2);

// Use async/await over callbacks
async function fetchUserComplaints() {
  try {
    const complaints = await Complaint.find({ userId });
    return complaints;
  } catch (error) {
    console.error('Error fetching complaints:', error);
    throw error;
  }
}
```

### React/Frontend Style

```javascript
// Use functional components with hooks
import { useState, useEffect } from 'react';

function ComplaintForm() {
  const [formData, setFormData] = useState({
    type: '',
    description: '',
  });

  // Use meaningful component names
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Use useEffect for side effects
  useEffect(() => {
    // Load data on component mount
  }, []);

  return (
    <form onSubmit={handleFormSubmit}>
      {/* JSX content */}
    </form>
  );
}

export default ComplaintForm;
```

### Error Handling

```javascript
// Backend - Proper error handling
app.post('/api/complaints', async (req, res) => {
  try {
    // Validate input
    if (!req.body.description) {
      return res.status(400).json({
        success: false,
        message: 'Description is required'
      });
    }

    // Process request
    const complaint = await Complaint.create(req.body);
    
    return res.status(201).json({
      success: true,
      complaint
    });
  } catch (error) {
    console.error('Error creating complaint:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating complaint',
      error: error.message
    });
  }
});
```

### Comments & Documentation

```javascript
/**
 * Calculate the distance between two geographic points
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  // Implementation here
}

// Bad comment
const x = 5; // Sets x to 5

// Good comment
const maxRetries = 5; // Maximum number of API retry attempts
```

### File and Folder Naming

- **Folders**: lowercase with hyphens (`user-controller`, `auth-routes`)
- **Files**: 
  - Components: PascalCase (`UserProfile.jsx`)
  - Utilities: camelCase (`emailService.js`)
  - Constants: UPPER_SNAKE_CASE (`API_ENDPOINTS.js`)

### Commit Messages

Write clear commit messages:

```
# Good
git commit -m "Add email notification for complaint status update"
git commit -m "Fix authentication middleware validation issue"
git commit -m "Update API documentation for user endpoints"

# Bad
git commit -m "Update"
git commit -m "Fix bug"
git commit -m "changes"
```

Format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat(complaint): add email notification on status change

Users now receive email notifications when their complaint status is updated.

Closes #123
```

## 🧪 Testing

### Backend Testing

```powershell
cd backend
npm test
```

Write tests for:
- API endpoints
- Controllers
- Middlewares
- Utils

### Frontend Testing

```powershell
cd frontend
npm test
```

Test components, hooks, and utilities.

### Manual Testing

1. **Test all user roles**:
   - User (complaint submission)
   - Police (complaint management)
   - Station Head (station oversight)
   - Admin (system management)

2. **Test workflows**:
   - Registration and login
   - Complaint submission and tracking
   - Status updates
   - File uploads

3. **Browser compatibility**:
   - Chrome
   - Firefox
   - Safari
   - Edge

## 📝 Pull Request Process

### 1. Before Submitting PR

```powershell
# Update your branch with latest changes
git fetch upstream
git rebase upstream/main

# Lint code
npm run lint
npm run lint -- --fix  # Auto-fix issues

# Test your changes
npm test
```

### 2. Create Pull Request

- **Title**: Clear, descriptive (e.g., "Add email notifications for complaint updates")
- **Description**: Include:
  - What changes were made
  - Why changes were made
  - How to test the changes
  - Related issues (Fixes #123)
  - Screenshots (if UI changes)

### 3. PR Template

```markdown
## Description
Brief description of the changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How to Test
Steps to test the feature/fix.

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Changes tested locally

## Screenshots (if applicable)
Add screenshots for UI changes.

## Related Issues
Fixes #123
```

## 🔍 Code Review Process

### What Reviewers Look For

- ✅ Code quality and consistency
- ✅ Test coverage
- ✅ Documentation
- ✅ Security
- ✅ Performance
- ✅ No breaking changes
- ✅ Follows project guidelines

### Responding to Feedback

- Be respectful and open to feedback
- Ask clarifying questions if needed
- Make requested changes promptly
- Re-request review after changes
- Thank reviewers for their time

## 🐛 Reporting Bugs

### Security Vulnerabilities

**Do NOT** create public issues for security vulnerabilities.

Email: security@reportit.com

Include:
- Description of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Regular Bugs

Use GitHub Issues with the bug template:
- Clear title
- Detailed description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots
- System information

## 📚 Documentation Contributions

### Areas to Document

- New features
- API endpoints
- Configuration options
- Troubleshooting guides
- Setup instructions
- Code examples

### Documentation Format

```markdown
# Feature Name

Brief description.

## Usage

```javascript
// Code example
```

## Parameters

- `param1`: Description
- `param2`: Description

## Returns

Description of return value.

## Examples

### Example 1
Description and code.

### Example 2
Description and code.
```

## 🚀 Development Workflow

### Step-by-Step

1. **Create Issue** (optional but recommended)
   - Discuss major changes before coding

2. **Create Feature Branch**
   ```powershell
   git checkout -b feature/user-preferences
   ```

3. **Make Changes**
   - Write code following guidelines
   - Add tests
   - Update documentation

4. **Commit Changes**
   ```powershell
   git add .
   git commit -m "feat(user): add preference settings"
   ```

5. **Push to Fork**
   ```powershell
   git push origin feature/user-preferences
   ```

6. **Create Pull Request**
   - Go to GitHub
   - Compare your fork with upstream
   - Create PR with description

7. **Address Feedback**
   - Make requested changes
   - Commit and push
   - Re-request review

8. **Merge**
   - PR is merged to main

## 📊 Project Structure Guideline

When adding new features, follow the structure:

### Backend Feature
```
routes/
  └── newFeatureRoutes.js

controllers/
  └── newFeatureController.js

models/
  └── NewFeature.js

middlewares/
  └── newFeatureMiddleware.js (if needed)

utils/
  └── newFeatureUtils.js (if needed)
```

### Frontend Feature
```
pages/
  └── NewFeaturePage.jsx

components/
  └── NewFeatureComponent.jsx

context/
  └── NewFeatureContext.jsx (if needed)

services/
  └── newFeatureService.js (if needed)
```

## ✨ Best Practices

### Code Quality

- [ ] Follow linting rules
- [ ] Write meaningful tests
- [ ] Add JSDoc comments
- [ ] Keep functions small
- [ ] Handle errors gracefully
- [ ] Validate all inputs
- [ ] Use consistent naming

### Git Practices

- [ ] Commit frequently
- [ ] Write descriptive messages
- [ ] Review your own code before PR
- [ ] Keep commits focused
- [ ] Squash related commits if needed

### Security

- [ ] Never commit secrets or passwords
- [ ] Validate and sanitize inputs
- [ ] Use environment variables for config
- [ ] Check dependencies for vulnerabilities
- [ ] Follow OWASP guidelines

## 🎓 Learning Resources

- [Node.js Best Practices](https://nodejs.org/en/docs/)
- [React Documentation](https://react.dev)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Express.js Guide](https://expressjs.com/)
- [Git Documentation](https://git-scm.com/doc)

## 📞 Getting Help

- **Issues**: Create a GitHub issue
- **Discussions**: Use GitHub Discussions
- **Email**: contributors@reportit.com
- **Chat**: Discord community (if available)

## 🎉 Recognition

Contributors are recognized in:
- CONTRIBUTORS.md
- Release notes
- Project README
- GitHub insights

---

Thank you for contributing to ReportIt! Your efforts help make the system better for everyone.

**Last Updated**: March 2026
