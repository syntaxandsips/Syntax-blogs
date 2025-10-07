# Markdown Guide for Blog Authors

This guide explains how to format your blog posts using Markdown, with special focus on code blocks and other advanced features available in our blog platform.

## Table of Contents

- [Basic Formatting](#basic-formatting)
- [Code Blocks](#code-blocks)
  - [Syntax Highlighting](#syntax-highlighting)
  - [Multiple Language Tabs](#multiple-language-tabs)
- [YouTube Embeds](#youtube-embeds)
- [Images](#images)
- [Other Elements](#other-elements)

## Basic Formatting

| Element | Markdown Syntax |
|---------|----------------|
| Heading | `# H1` <br> `## H2` <br> `### H3` |
| Bold | `**bold text**` |
| Italic | `*italicized text*` |
| Blockquote | `> blockquote` |
| Ordered List | `1. First item` <br> `2. Second item` |
| Unordered List | `- First item` <br> `- Second item` |
| Link | `[title](https://www.example.com)` |
| Image | `![alt text](image.jpg)` |

## Code Blocks

### Syntax Highlighting

To create a code block with syntax highlighting, use triple backticks (```) followed by the language name:

````markdown
```javascript
function helloWorld() {
  console.log("Hello, world!");
}
```
````

This will render as:

```javascript
function helloWorld() {
  console.log("Hello, world!");
}
```

### Supported Languages

Our platform supports syntax highlighting for many languages, including:

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

### Multiple Language Tabs

To create code blocks with multiple language tabs, use our special syntax with language identifiers:

````markdown
{:code-block}
{:javascript}
function helloWorld() {
  console.log("Hello, world!");
}
{:python}
def hello_world():
    print("Hello, world!")
{:java}
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, world!");
    }
}
{:code-block}
````

This will create a tabbed interface where users can switch between JavaScript, Python, and Java implementations.

### Important Notes for Code Blocks

1. Make sure there's no space between the backticks and the language name
2. For multiple language tabs, ensure each language section starts with `{:language-name}`
3. Always close multiple language blocks with `{:code-block}`
4. Indent your code properly for better readability

## YouTube Embeds

To embed a YouTube video, use the following syntax:

````markdown
{youtube:VIDEO_ID}
````

Replace `VIDEO_ID` with the actual YouTube video ID. For example:

````markdown
{youtube:dQw4w9WgXcQ}
````

## Images

For basic images, use the standard Markdown syntax:

````markdown
![Alt text](image-url.jpg)
````

For images with captions or additional styling:

````markdown
{:image}
![AI-generated art](ai-art.jpg)
Caption: This image was created using a neural network
{:image}
````

## Other Elements

### Callouts/Notes

````markdown
{:note}
This is an important note for readers.
{:note}
````

### Warnings

````markdown
{:warning}
Be careful when implementing this code in production!
{:warning}
````

### Tips

````markdown
{:tip}
Here's a pro tip to make your code more efficient.
{:tip}
````

## Example Blog Post

Here's a complete example that demonstrates various formatting options:

```markdown
# Understanding Neural Networks

## Introduction

Neural networks are the foundation of modern AI. Let's explore how they work.

## Basic Structure

A neural network consists of:
- Input layer
- Hidden layers
- Output layer

## Code Implementation

Here's how to implement a simple neural network in different languages:

{:code-block}
{:python}
import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

class NeuralNetwork:
    def __init__(self, input_size, hidden_size, output_size):
        self.weights1 = np.random.randn(input_size, hidden_size)
        self.weights2 = np.random.randn(hidden_size, output_size)
        
    def forward(self, X):
        self.hidden = sigmoid(np.dot(X, self.weights1))
        self.output = sigmoid(np.dot(self.hidden, self.weights2))
        return self.output
{:javascript}
class NeuralNetwork {
  constructor(inputSize, hiddenSize, outputSize) {
    this.weights1 = Array.from({ length: inputSize }, () => 
      Array.from({ length: hiddenSize }, () => Math.random() - 0.5)
    );
    this.weights2 = Array.from({ length: hiddenSize }, () => 
      Array.from({ length: outputSize }, () => Math.random() - 0.5)
    );
  }
  
  sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }
  
  forward(inputs) {
    // Matrix multiplication and activation
    this.hidden = inputs.map((_, i) => 
      this.sigmoid(this.weights1[i].reduce((sum, w, j) => sum + w * inputs[j], 0))
    );
    this.output = this.hidden.map((_, i) => 
      this.sigmoid(this.weights2[i].reduce((sum, w, j) => sum + w * this.hidden[j], 0))
    );
    return this.output;
  }
}
{:code-block}

{:note}
The above implementations are simplified for educational purposes.
{:note}

## Learn More

Watch this excellent explanation of neural networks:

{youtube:aircAruvnKk}

## Conclusion

Neural networks are powerful tools for machine learning tasks. With proper training, they can solve complex problems in various domains.
```

---

Remember, good formatting makes your blog posts more readable and engaging. Use these Markdown features to create professional-looking content that readers will enjoy.
