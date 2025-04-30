# Code Block Guide for Admin Panel

This guide explains how to add code blocks with syntax highlighting and language selection tabs in the admin panel's blog post editor.

## Basic Code Blocks

When writing your blog post in the admin panel, you can add code blocks using Markdown syntax. Here's how:

1. In the "Content (Markdown)" field of the post form, use triple backticks (```) followed by the language name to create a code block.

Example:

```
```javascript
function helloWorld() {
  console.log("Hello, world!");
}
```
```

This will render on the blog page as:

```javascript
function helloWorld() {
  console.log("Hello, world!");
}
```

With syntax highlighting for JavaScript and a copy button.

## Multi-Language Code Blocks

Our blog platform supports showing the same code example in multiple programming languages with a tabbed interface. Here's how to create them:

1. Use the special syntax with `{:code-block}` tags and language identifiers.

Example:

```
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
```

This will create a tabbed interface where readers can switch between JavaScript, Python, and Java implementations.

## Supported Languages

The following languages are supported for syntax highlighting:

- javascript (js)
- typescript (ts)
- python (py)
- java
- c
- cpp (c++)
- csharp (c#)
- go
- rust
- ruby
- php
- swift
- kotlin
- html
- css
- json
- yaml
- bash (shell)
- sql

## Tips for Better Code Blocks

1. **Always specify the language** - This ensures proper syntax highlighting.
2. **Use consistent indentation** - This makes your code more readable.
3. **Keep examples concise** - Focus on the specific concept you're explaining.
4. **Add comments** - Explain complex parts of your code with comments.
5. **Test your code** - Ensure the code examples actually work before publishing.

## Example Blog Post with Code

Here's a complete example of a blog post with various code blocks:

```markdown
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

Let's compare how to implement a simple delay function across languages:

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
```

## Troubleshooting

If your code blocks aren't rendering correctly:

1. **Check your backticks** - Ensure you're using the correct number of backticks (three) and they're properly closed.
2. **Verify language names** - Make sure you're using supported language identifiers.
3. **Preview your post** - After saving, check how it looks on the actual blog page.
4. **Special characters** - If your code contains triple backticks, you may need to escape them.

## Need More Help?

For more detailed information about Markdown formatting, check out the [full Markdown guide](../docs/markdown-guide.md).
