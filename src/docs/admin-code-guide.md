# Admin Code Block Authoring Guide

Crafting polished, trustworthy technical content starts with well-structured code examples. This guide walks you through every tool available in the Syntax Blogs admin editor so you can publish posts that look as good as they read.

> [!TIP]
> Bookmark this page. It doubles as both an onboarding checklist for new authors and a reference for experienced editors who need a refresher.

## At a Glance

| Task | Where to Configure | Key Reminder |
| --- | --- | --- |
| Insert a single-language snippet | **Content (Markdown)** field | Wrap code in triple backticks and name the language. |
| Showcase equivalent code in multiple languages | `{:code-block}` container | Provide a language label before each snippet. |
| Validate formatting | Post preview panel | Confirm the copy button and tab switcher render as expected. |

## Authoring Workflow

1. **Draft or paste your article** into the "Content (Markdown)" field inside the admin panel.
2. **Enhance the narrative** with code samples using the patterns below.
3. **Save the draft** to trigger the live preview, verifying that tabs, highlighting, and copy buttons are present.
4. **Publish with confidence** once the rendered result mirrors the examples in this guide.

> [!IMPORTANT]
> The preview mirrors production styling. If something looks wrong here, it will also look wrong on the public site—always troubleshoot before publishing.

## Single-Language Code Blocks

When you only need one language, stick with classic fenced code blocks:

1. Start with three backticks (```) followed immediately by the language name.
2. Paste or type your code.
3. Close the block with three backticks on a new line.

**Markdown input**

````markdown
```javascript
function helloWorld() {
  console.log("Hello, world!");
}
```
````

**Rendered output**

```javascript
function helloWorld() {
  console.log("Hello, world!");
}
```

Syntax highlighting and the copy-to-clipboard button are automatically applied when the language identifier is supplied.

## Multi-Language Code Tabs

Syntax Blogs can present the same example in multiple languages inside a single, tabbed component—perfect for framework comparisons and polyglot tutorials.

Follow this pattern:

````markdown
{:code-block}
{:javascript}
function calculateArea(radius) {
  return Math.PI * radius * radius;
}
{:python}
def calculate_area(radius):
    import math
    return math.pi * radius ** 2
{:java}
public double calculateArea(double radius) {
    return Math.PI * radius * radius;
}
{:code-block}
````

Each `{:language}` tag introduces a new tab. The surrounding `{:code-block}` markers open and close the tabbed component.

> [!NOTE]
> The tab order follows the order of the language declarations. Lead with the language most relevant to your article’s primary audience.

## Supported Language Identifiers

Use the identifiers exactly as listed to guarantee proper syntax highlighting and iconography.

| Language | Identifier(s) |
| --- | --- |
| Bash / Shell | `bash`, `shell` |
| C | `c` |
| C++ | `cpp`, `c++` |
| C# | `csharp`, `c#` |
| CSS | `css` |
| Go | `go` |
| HTML | `html` |
| Java | `java` |
| JavaScript | `javascript`, `js` |
| JSON | `json` |
| Kotlin | `kotlin` |
| PHP | `php` |
| Python | `python`, `py` |
| Ruby | `ruby` |
| Rust | `rust` |
| SQL | `sql` |
| Swift | `swift` |
| TypeScript | `typescript`, `ts` |
| YAML | `yaml` |

## Presentation Best Practices

- **Name every block.** Unguarded triple backticks render plain text and disable copy buttons.
- **Keep it scannable.** Short snippets communicate concepts faster—link to a repo for full scripts.
- **Show, then tell.** Surround code with context that explains why the snippet matters.
- **Comment the tricky parts.** Inline comments prevent reader confusion and reduce support requests.
- **Test before publishing.** Broken samples undermine trust; run them locally first.

## End-to-End Example

Need inspiration? This template demonstrates how a rich tutorial should be structured.

````markdown
# Understanding Async/Await in Different Languages

Modern programming languages provide different ways to handle asynchronous operations. Let's explore how async/await works across languages.

## JavaScript/TypeScript

```javascript
async function fetchUserData(userId) {
  try {
    const response = await fetch(`https://api.example.com/users/${userId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

// Usage
fetchUserData(123).then(user => {
  console.log(user);
});
```

## Python

```python
import asyncio
import aiohttp

async def fetch_user_data(user_id):
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f'https://api.example.com/users/{user_id}') as response:
                return await response.json()
    except Exception as e:
        print(f'Error fetching user data: {e}')
        return None

# Usage
async def main():
    user = await fetch_user_data(123)
    print(user)

asyncio.run(main())
```

## Comparing Implementations

{:code-block}
{:javascript}
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function example() {
  console.log('Starting');
  await delay(1000);
  console.log('After 1 second');
}
{:python}
import asyncio

async def delay(seconds):
    await asyncio.sleep(seconds)

async def example():
    print('Starting')
    await delay(1)
    print('After 1 second')
{:csharp}
using System;
using System.Threading.Tasks;

public class Program
{
    static async Task Delay(int milliseconds)
    {
        await Task.Delay(milliseconds);
    }

    static async Task Example()
    {
        Console.WriteLine("Starting");
        await Delay(1000);
        Console.WriteLine("After 1 second");
    }
}
{:code-block}

Each implementation achieves the same result but uses language-specific constructs.
````

## Troubleshooting Checklist

| Issue | What to Verify |
| --- | --- |
| Tabs not appearing | Ensure the block starts and ends with `{:code-block}`. |
| No syntax highlighting | Confirm the language identifier is supported and spelled correctly. |
| Backticks rendering in the output | Escape nested backticks using four backticks (````) around the block. |
| Copy button missing | Make sure the block isn’t indented and that a language is specified. |

> [!HELP]
> Preview after every major edit. Rendering glitches usually appear immediately and are faster to fix before the article grows.

## Admin Test Account

Quickly validate your post with seeded data:

1. Run `npm run seed:test-user` once database migrations are applied.
2. Sign in using **test.admin@syntaxblogs.dev** with password **TestAdmin123!**.
3. Re-run the seed script any time you need to reset the password or repopulate data.

Remember to disable or delete this account before pushing changes to production.

## Additional Resources

- Deep dive into Markdown features in the [full Markdown guide](./markdown-guide.md).
- Need layout or styling assistance? Reach out in the `#content-platform` channel for same-day support.
