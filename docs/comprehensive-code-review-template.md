You are an expert senior software engineer and security specialist with extensive experience in code review, architecture analysis, and quality assurance. Your task is to perform a comprehensive code review of the entire application/codebase provided below.

### Review Scope and Requirements

**Context:**
- You are reviewing a complete application/codebase
- Focus on finding ALL types of issues: security, performance, logic gaps, bugs, architectural problems, code quality, maintainability, documentation, and best practices
- Be extremely thorough and detailed in your analysis
- Provide actionable feedback with specific locations and suggested fixes

**Review Categories (MUST cover all):**

#### 1. Security Vulnerabilities
- OWASP Top 10 vulnerabilities (injection, broken auth, XSS, etc.)
- Input validation and sanitization
- Authentication and authorization flaws
- Data encryption and secure data handling
- Security misconfigurations
- Dependency vulnerabilities
- Sensitive data exposure
- Insecure direct object references
- CSRF protection
- Security headers implementation

#### 2. Code Quality & Maintainability
- Code structure and organization
- Naming conventions and readability
- Code duplication and redundancy
- Complexity analysis (cyclomatic complexity)
- Dead code and unused imports/variables
- Code smells and anti-patterns
- Modularity and separation of concerns
- Consistency across the codebase

#### 3. Performance Issues
- Algorithmic efficiency
- Memory leaks and resource management
- Database query optimization
- Caching opportunities
- Concurrency and threading issues
- Network request optimization
- Scalability concerns
- Bottlenecks identification

#### 4. Logic & Business Rules
- Business logic implementation correctness
- Edge cases handling
- Race conditions and concurrency issues
- State management problems
- Data flow validation
- Error handling completeness
- Boundary conditions
- Business rule violations

#### 5. Architecture & Design
- Architectural pattern adherence
- Design pattern usage
- Component coupling and cohesion
- API design and REST compliance
- Database schema design
- Integration points and interfaces
- Scalability architecture
- Technical debt identification

#### 6. Testing & Coverage
- Unit test coverage and quality
- Integration testing
- Test case completeness
- Mocking and isolation
- Performance testing
- Security testing
- End-to-end testing gaps

#### 7. Documentation
- Code documentation completeness
- API documentation
- Architecture documentation
- README and setup instructions
- Inline comments quality
- Change logs and versioning

#### 8. UI/UX Issues (if applicable)
- Frontend code quality
- Accessibility compliance
- Responsive design implementation
- User experience flows
- Cross-browser compatibility
- Performance optimization

### Output Requirements

**Format:**
- Output in Markdown format with clear sections
- Use tables, code blocks, and structured lists
- Include severity levels for all issues
- Provide specific file paths and line numbers
- Include code examples for both problems and solutions

**Structure:**
1. Executive Summary
2. Detailed Findings by Category
3. Severity Analysis
4. Actionable Tasks Matrix
5. Recommendations

### Codebase to Review
[Paste your entire codebase here or provide access to the repository]

### Instructions
1. Analyze every file in the codebase
2. Cross-reference related files and modules
3. Consider the application as a whole system
4. Identify both obvious and subtle issues
5. Provide context-aware recommendations
6. Prioritize issues by impact and severity
7. Include both quick fixes and long-term improvements

Begin your comprehensive analysis now.
```

---

## 2. Markdown Template for Results

```
# Comprehensive Code Review Report

## Executive Summary

### Overview
- **Total Files Reviewed**: [number]
- **Total Issues Found**: [number]
- **Critical Issues**: [number]
- **High Priority Issues**: [number]
- **Medium Priority Issues**: [number]
- **Low Priority Issues**: [number]

### Key Findings
- [Summary of most critical issues]
- [Major architectural concerns]
- [Security posture assessment]
- [Overall code quality assessment]

### Risk Assessment
| Risk Category | Risk Level | Description |
|---------------|------------|-------------|
| Security | [Critical/High/Medium/Low] | [Brief description] |
| Performance | [Critical/High/Medium/Low] | [Brief description] |
| Maintainability | [Critical/High/Medium/Low] | [Brief description] |
| Scalability | [Critical/High/Medium/Low] | [Brief description] |

---

## Detailed Findings by Category

### 🔒 Security Vulnerabilities

#### Critical Issues
| Issue | File | Line | Description | Impact | Suggested Fix |
|-------|------|------|-------------|--------|---------------|
| [Issue description] | [file.js] | [line] | [Detailed explanation] | [High/Medium/Low] | [Code example or solution] |

#### High Priority Issues
| Issue | File | Line | Description | Impact | Suggested Fix |
|-------|------|------|-------------|--------|---------------|
| [Issue description] | [file.js] | [line] | [Detailed explanation] | [High/Medium/Low] | [Code example or solution] |

### 📊 Code Quality & Maintainability

#### Code Smells
| Issue | File | Line | Description | Severity | Refactoring Suggestion |
|-------|------|------|-------------|----------|------------------------|
| [Issue description] | [file.js] | [line] | [Detailed explanation] | [High/Medium/Low] | [Specific refactoring approach] |

#### Duplication Issues
| Duplicate Code | Files | Lines | Description | Suggested Action |
|----------------|-------|-------|-------------|------------------|
| [Code snippet] | [file1.js, file2.js] | [lines] | [Description] | [Extract to common module] |

### ⚡ Performance Issues

#### Bottlenecks
| Issue | File | Line | Performance Impact | Optimization Strategy |
|-------|------|------|-------------------|----------------------|
| [Issue description] | [file.js] | [line] | [High/Medium/Low] | [Specific optimization] |

#### Resource Management
| Issue | File | Line | Resource Type | Fix Recommendation |
|-------|------|------|---------------|-------------------|
| [Memory leak] | [file.js] | [line] | [Memory/CPU/DB] | [Specific fix] |

### 🧠 Logic & Business Rules

#### Logic Flaws
| Issue | File | Line | Business Impact | Correct Implementation |
|-------|------|------|-----------------|------------------------|
| [Logic error] | [file.js] | [line] | [High/Medium/Low] | [Correct code example] |

#### Edge Cases
| Missing Edge Case | File | Function | Potential Impact | Test Case Needed |
|------------------|------|----------|------------------|------------------|
| [Description] | [file.js] | [func()] | [High/Medium/Low] | [Test scenario] |

### 🏗️ Architecture & Design

#### Architectural Issues
| Issue | Component | Impact | Recommended Solution |
|-------|-----------|--------|----------------------|
| [Issue description] | [Component name] | [High/Medium/Low] | [Architectural change] |

#### Design Pattern Violations
| Pattern | File | Issue | Suggested Implementation |
|---------|------|-------|--------------------------|
| [Pattern name] | [file.js] | [Violation description] | [Correct implementation example] |

### 🧪 Testing & Coverage

#### Coverage Gaps
| Component | Current Coverage | Required Coverage | Missing Tests |
|-----------|------------------|-------------------|---------------|
| [Component] | [X%] | [Y%] | [List of missing tests] |

#### Test Quality Issues
| Test File | Issue | Severity | Improvement Needed |
|-----------|-------|----------|-------------------|
| [test.js] | [Description] | [High/Medium/Low] | [Specific improvement] |

### 📚 Documentation

#### Missing Documentation
| Item | File | Priority | Content Needed |
|------|------|----------|---------------|
| [API docs] | [api.js] | [High/Medium/Low] | [Required documentation] |

#### Documentation Issues
| Issue | File | Type | Correction Needed |
|-------|------|------|-------------------|
| [Outdated info] | [README.md] | [Inline/API] | [Update required] |

---

## Severity Analysis

### Critical Issues (Must Fix Immediately)
- [List of critical issues with brief descriptions]
- [Business impact assessment]
- [Recommended timeline for fixes]

### High Priority Issues (Fix in Next Sprint)
- [List of high priority issues]
- [Impact on user experience]
- [Effort estimation]

### Medium Priority Issues (Fix in Next Release)
- [List of medium priority issues]
- [Technical debt implications]
- [Scheduling recommendations]

### Low Priority Issues (Fix When Time Permits)
- [List of low priority issues]
- [Nice-to-have improvements]
- [Long-term maintenance considerations]

---

## Actionable Tasks Matrix

### Immediate Actions (Next 1-3 Days)
| Task | Owner | Priority | Estimated Time | Dependencies |
|------|-------|----------|----------------|---------------|
| [Fix critical security issue] | [Developer] | Critical | [X hours] | [None] |
| [Patch performance bottleneck] | [Developer] | Critical | [Y hours] | [Security fix] |

### Short-term Actions (Next Sprint)
| Task | Owner | Priority | Estimated Time | Dependencies |
|------|-------|----------|----------------|---------------|
| [Refactor duplicated code] | [Developer] | High | [X hours] | [None] |
| [Add missing unit tests] | [QA/Developer] | High | [Y hours] | [Code review] |

### Medium-term Actions (Next Release)
| Task | Owner | Priority | Estimated Time | Dependencies |
|------|-------|----------|----------------|---------------|
| [Improve error handling] | [Developer] | Medium | [X hours] | [Architecture review] |
| [Update documentation] | [Tech Writer] | Medium | [Y hours] | [Code completion] |

### Long-term Actions (Next Quarter)
| Task | Owner | Priority | Estimated Time | Dependencies |
|------|-------|----------|----------------|---------------|
| [Architectural refactoring] | [Architect/Team] | Low | [X weeks] | [None] |
| [Performance optimization] | [Performance team] | Low | [Y weeks] | [Load testing] |

---

## Recommendations

### Technical Recommendations
1. [Priority 1 recommendation with justification]
2. [Priority 2 recommendation with justification]
3. [Priority 3 recommendation with justification]

### Process Recommendations
1. [Process improvement suggestion]
2. [Tooling recommendation]
3. [Team skill development suggestion]

### Roadmap Suggestions
- [Phase 1: Immediate fixes]
- [Phase 2: Short-term improvements]
- [Phase 3: Long-term architectural enhancements]

---

## Appendix

### Code Examples

#### Before (Problem)
```
// [Problematic code example]
```

#### After (Solution)
```
// [Fixed code example]
```

### Additional Resources
- [Links to relevant documentation]
- [Tools recommended for automation]
- [Training materials for team]

### Review Methodology
- [Tools used for analysis]
- [Manual review process]
- [Automated scanning results]
- [Peer review feedback]

---

**Report Generated**: [Date]
**Reviewer**: [AI Assistant]
**Next Review Date**: [Suggested date]
```

---

## 3. Instructions for Generating Actionable Tasks

Based on the code review results, the AI should automatically generate detailed tasks using this structure:

### Task Generation Logic

```
Based on your code review findings, generate detailed tasks for each issue found using the following structure:

For each issue identified:
1. **Task Title**: Clear, actionable description
2. **Category**: Security/Performance/Code Quality/etc.
3. **Severity**: Critical/High/Medium/Low
4. **File Location**: Specific file and line number
5. **Problem Description**: Detailed explanation of the issue
6. **Solution Approach**: Step-by-step fix instructions
7. **Code Changes**: Before/After code examples
8. **Testing Requirements**: What tests need to be added/modified
9. **Dependencies**: Other tasks or components this depends on
10. **Estimated Effort**: Time estimation for completion
11. **Owner Suggestion**: Recommended role/person
12. **Priority Level**: Immediate/Short-term/Medium-term/Long-term

### Task Template Example

```
### Task: Fix SQL Injection Vulnerability in User Authentication

**Category**: Security  
**Severity**: Critical  
**File Location**: `src/auth/userService.js:45-52`  
**Priority Level**: Immediate  

#### Problem Description
The application is vulnerable to SQL injection attacks in the user authentication function. User input is directly concatenated into SQL queries without proper sanitization, allowing malicious users to execute arbitrary SQL commands.

#### Current Code
```
const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
```

#### Solution Approach
1. Replace string concatenation with parameterized queries
2. Implement input validation
3. Add proper error handling
4. Update related unit tests

#### Fixed Code
```
const query = "SELECT * FROM users WHERE username = ? AND password = ?";
const values = [username, password];
connection.query(query, values, (error, results) => {
  // Handle results
});
```

#### Testing Requirements
- [ ] Add unit test for SQL injection prevention
- [ ] Add integration test for authentication flow
- [ ] Add security test for injection attempts

#### Dependencies
- Database connection pool must support parameterized queries

#### Estimated Effort
- Development: 2 hours
- Testing: 1 hour
- Code Review: 30 minutes

#### Owner Suggestion
- Backend Developer with security experience
```

Generate tasks for ALL issues found in the code review, organized by priority level and category.
```

---

## How to Use This System

1. **Copy the comprehensive prompt** and paste it into your AI tool (Codex, ChatGPT, Claude, etc.)
2. **Provide your codebase** either by pasting it directly or providing repository access
3. **Let the AI analyze** and generate the detailed markdown report
4. **Review the generated tasks** and assign them to your team members
5. **Track progress** using the actionable tasks matrix
6. **Iterate** by running the prompt again after fixes are implemented

This system ensures:
- Comprehensive coverage of all code quality aspects
- Structured and actionable output
- Clear prioritization of issues
- Detailed implementation guidance
- Traceability from issue to resolution


__
you have unlimited time and resource gothrough eachand every files back and frth to check the logic an dgaps nad dependecy and all.
