### [[Chinese Document]](README.md)

# 🎨 Zhi.AI ComfyUI Node Pack 

<p align="center">
  <img src="icon.png" alt="Zhi.AI ComfyUI Node Pack" width="180"/>
</p>

## 📖 Project Introduction

This is a ComfyUI custom node tool collection carefully created by **Binity**, designed to provide users with a series of practical and efficient nodes to enhance and extend ComfyUI's functionality. This node collection contains 56 functional nodes, covering text processing, prompt optimization, image processing, translation tools, music creation assistance, AI vision understanding, Latent processing, and other aspects, providing comprehensive support for your AI creation.

***If this project helps you, please give us a ⭐Star! Your support is our motivation for continuous improvement.***

## ✨ Main Features

### 🌍 **Built-in Chinese/English Localization**
The node pack ships with its own Chinese/English dictionary and follows ComfyUI's **Language** setting, automatically switching the node language — no third-party translation extension required.

### **Core Functionality Features**

- 🔄 **Multi-Engine Translation Nodes**: Integrates 5 major translation platforms including Baidu, Alibaba Cloud, Youdao, Zhipu AI and Google, supporting Chinese-English mutual translation with automatic input language detection and flexible platform switching.

- 📝 **Comprehensive Text Processing**: Provides text operation nodes including multi-line text editing, text merging and separation, content extraction and modification, and language filtering.

- 🎯 **Intelligent Prompt System**: Professional prompt generation tools such as Tag Selector, Image Editing Presets, Photography Prompt Generator, and WanXiang Video Prompt Generator.

- 🖼️ **Practical Image Tools**: Supports multi-algorithm image scaling, intelligent switching, color removal, and more.

## ⭐ Featured Nodes

🔥 **<span style="color: #FF6B35; font-weight: bold; font-size: 1.1em;">Here are the recommended featured nodes in this collection:</span>**

<table>
<tr>
<th width="30%">Node Name</th>
<th width="19%">Category</th>
<th width="51%">Core Functionality</th>
</tr>
<tr>
<td><b>TagSelector</b><br><b>Tag Selector</b><br><code>TagSelector</code></td>
<td>Prompt Processing</td>
<td>A new generation of intelligent tag management system, providing a visual tag selection interface, supporting custom tag management and intelligent search functions. Rich in categories, covering numerous professional tags such as image quality, photography, and artistic styles.</td>
</tr>
<tr>
<td><b>Photography Prompt Generator</b><br><code>PhotographPromptGenerator</code></td>
<td>Prompt Processing</td>
<td>Professional photography-style prompt generator, covering 32 dimensions including characters, scenes, lenses, lighting, and clothing. Supports tag-combination and template-text output modes plus random selection for more variety. Equipped with user-defined option extension and template editing assistant interface.</td>
</tr>
<tr>
<td><b>LM Studio Node</b><br><code>LMStudioNode</code></td>
<td>AI Assistant</td>
<td>A vision understanding node that connects to a local LM Studio server, supporting image analysis and text generation. Enables private image analysis using locally deployed models without cloud APIs. Supports multiple preset templates, output language control, and multi-image input.</td>
</tr>
<tr>
<td><b>Image Understanding Online</b><br><code>ImageUnderstandingOnline</code></td>
<td>AI Assistant</td>
<td>Image understanding through any OpenAI-compatible online multimodal endpoint — no local GPU required. Preconfigure up to 6 platform profiles and switch between them directly from the node's dropdown. Handles single or multiple images, lets a text prompt port take over the whole prompt section, runs as a plain text node when no image is docked, and shares the LM Studio node's prompt template categories and batch processing.</td>
</tr>
</table>

💡 **Usage Recommendation**: New users are recommended to start with the **Tag Selector** to quickly enhance your creative inspiration and efficiency.

---

## 🛠️ Node Functionality Description

This node collection contains numerous nodes with different functionalities, divided into the following main categories:

### 📝 Text Processing Nodes

<table>
<tr>
<th width="30%">Node Name</th>
<th>Function Description</th>
</tr>
<tr>
<td><b>Multi-line Text</b><br><code>MultiLineTextNode</code></td>
<td>Provides a text box supporting multi-line input with comment functionality.

<br>
<div align="left">
<a href="images/多行文本.jpg" target="_blank">
<img src="images/多行文本.jpg" alt="Multi-line Text" width="45%"/>
</a>
</div></td>
</tr>
<tr>
<td><b>Prompt Combiner</b><br><code>PromptCombiner</code></td>
<td>Combines two prompts with a built-in English comma, each independently enable-able. Supports connecting the LoRA Stack Loader's <b>trigger_words</b> output, which is prepended to the combined result. Comments are edited via the node-top "✎ 注释" button and shown as hover tips on the inputs.

<br>
<div align="left">
<a href="images/提示词合并器.jpg" target="_blank">
<img src="images/提示词合并器.jpg" alt="Prompt Merger" width="45%"/>
</a>
</div></td>
</tr>
<tr>
<td><b>Text Merger</b><br><code>TextMergerNode</code></td>
<td>Merges multiple text inputs into a single output text, supporting flexible configuration of input port quantity. The content of the <b>user_text</b> input box is displayed first, followed by controlling the number of <b>text_2</b> to <b>text_N</b> ports through the <b>inputcount</b> slider. All non-empty texts are connected in sequence using a separator, suitable for batch merging of multiple prompts or text fragments.

<br>
<div align="left">
<a href="images/Text Merger Node.png" target="_blank">
<img src="images/Text Merger Node.png" alt="Text Merger" width="45%"/>
</a>
</div></td>
</tr>
<tr>
<td><b>Text Modifier</b><br><code>TextModifier</code></td>
<td>Extracts text content based on specified start and end markers, automatically removing excess whitespace characters. Suitable for extracting specific parts from complex text or performing format cleaning.

<br>
<div align="left">
<a href="images/Text Modifier.jpg" target="_blank">
<img src="images/Text Modifier.jpg" alt="Text Modifier" width="45%"/>
</a>
</div></td>
</tr>
<tr>
<td><b>Chinese-English Text Extractor</b><br><code>TextExtractor</code></td>
<td>Extracts pure Chinese or pure English characters from mixed text, supporting extraction of punctuation and numbers, and automatically cleaning the format. Very useful for processing bilingual prompts or separating different language content.<br><br>
<div align="left">
<a href="images/中英文本提取器.jpg" target="_blank">
<img src="images/中英文本提取器.jpg" alt="Text Extractor" width="45%"/>
</a>
</div></td>
</tr>
<tr>
<td><b>Prompt Delete</b><br><code>PromptDelete</code></td>
<td>Prompt Deletion Node: Supports dynamic number of search and delete operations, suitable for batch deleting unwanted trigger words, style words, or model-related text. Also supports auto-formatting to clean up residual symbols.
<br>
<div align="left">
<a href="images/Prompt Delete.jpg" target="_blank">
<img src="images/Prompt Delete.jpg" alt="Prompt Delete" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Prompt Replace</b><br><code>PromptReplace</code></td>
<td>Prompt replacement node: supports a dynamic number of find/replace operations, suitable for batch replacing trigger words, style terms, or model-related text.
<br>
<div align="left">
<a href="images/Prompt Replace.jpg" target="_blank">
<img src="images/Prompt Replace.jpg" alt="Prompt Replace" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Show Any</b><br><code>ShowAny</code></td>
<td>A node for displaying any type of content in the ComfyUI interface, supporting multi-line text display, which can show text information passed from upstream nodes in real-time, facilitating debugging and viewing intermediate results. Supports both standard mode and debug mode.</td>
</tr>
<tr>
<td><b>Text Editor (Continue Execution)</b><br><code>TextEditorWithContinue</code></td>
<td>An interactive text editing node that pauses workflow execution and provides an editable text area, allowing users to modify text content at runtime, and clicking the continue button resumes workflow execution.

<b>Features</b>:
- <b>Workflow Pause</b>: Automatically pauses workflow execution, waiting for user interaction
- <b>Real-time Editing</b>: Provides an editable text area, supporting multi-line text editing
- <b>Automatic Sync</b>: Automatically fetches and synchronizes the incoming text when the node pauses
- <b>Built-in Help</b>: Click the help button in the node's top-right corner to view usage instructions

<b>Use Cases</b>:
- Scenarios requiring human intervention and text adjustment in workflows
- Real-time optimization and debugging of prompts

<br>
<div align="left">
<a href="images/Text Editor with Continue.jpg" target="_blank">
<img src="images/Text Editor with Continue.jpg" alt="Text Editor with Continue" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Text Switch (Dual Mode)</b><br><code>TextSwitchDualMode</code></td>
<td>Dual mode switcher supporting variable number of text inputs. Control the number of ports through the slider <code>inputcount</code> and click the button <code>Update inputs</code> to synchronously add/remove ports; in manual mode, select output by index (the <code>select_text</code> option automatically updates with <code>inputcount</code>); in automatic mode, output only when there is a unique non-empty input, and an error will be prompted if multiple non-empty inputs are detected. All newly added text input ports are non-mandatory, suitable for flexible switching and comparative experiments between different version prompts.

<br>
<div align="left">
<a href="images/Text Switch Dual Mode.jpg" target="_blank">
<img src="images/Text Switch Dual Mode.jpg" alt="Text Switch (Dual Mode)" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Multi-Platform Translation</b><br><code>MultiPlatformTranslate</code></td>
<td>

Multi-platform translation node, supporting Baidu, Alibaba Cloud, Youdao, Zhipu AI and Google — 5 platforms in total. Users can set API keys for each platform through the configuration management interface to achieve high-quality professional translation services.

<b>Features</b>:
- <b>Multi-platform Support</b>: Supports mainstream translation platforms to meet different needs
- <b>Configuration Management</b>: Easily manage API keys for each platform through a graphical interface
- <b>Professional Translation</b>: Provides high-quality professional translation services

<div align="left">
<a href="images/Multi Platform Translate.jpg" target="_blank">
<img src="images/Multi Platform Translate.jpg" alt="Multi-Platform Translation" width="45%"/>
</a>
</div>
</td>
</tr>
</table>

### 🎯 Prompt Processing Nodes

<table>
<tr>
<th width="30%">Node Name</th>
<th>Function Description</th>
</tr>
<tr>
<td><b>🏷️TAG Selector</b><br><code>TagSelector</code></td>
<td>

A new generation of intelligent tag management system, integrating massive preset tag libraries, custom tag functionality, and built-in AI expansion capabilities, providing an unprecedented tag selection experience to quickly build complex prompts and improve creative efficiency.

<b>Core Functions</b>:
- <b>Rich Tag Categories:</b> Covers comprehensive categories including regular tags, art subjects, character attributes, scene environments, and more
- <b>Custom Tag Management:</b> Supports adding, editing, and deleting personal exclusive tags to create personalized tag libraries
- <b>Intelligent Search and Location:</b> Supports keyword search to quickly find target tags
- <b>Real-time Selection Statistics:</b> Dynamically displays the count and detailed list of selected tags
- <b>Random Tag Generation:</b> Intelligent random tag generation function, supporting automatic generation of diverse tag combinations based on category weights and quantity configuration
- <b>Built-in AI Expansion</b>: One-click intelligent expansion function, supporting both tag-style and natural language-style expansion modes

<br>
<div align="left">
<a href="images/Tag Selector1.jpg" target="_blank">
<img src="images/Tag Selector1.jpg" alt="Tag Selector1" width="45%"/>
</a>
<a href="images/Tag Selector2.jpg" target="_blank">
<img src="images/Tag Selector2.jpg" alt="Tag Selector2" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Prompt Card Selector</b><br><code>PromptCardSelector</code></td>
<td>Supports random/sequential extraction modes, single/multiple card loading, various splitting methods, and card pool shuffling strategies. Built-in card pool manager provides browsing/search/editing functions, supports importing/exporting card files, suitable for prompt combination and batch management.

<b>Features</b>:
- <b>Dual Extraction Modes</b>: Supports both random extraction and sequential extraction modes
- <b>Multi-card Loading</b>: Supports single-card and multi-card loading modes
- <b>Flexible Splitting</b>: Supports multiple text splitting methods (blank lines, line breaks, etc.)
- <b>Card Pool Management</b>: Built-in card pool manager providing browsing, searching, and editing functions
- <b>Import/Export</b>: Supports importing and exporting prompt card files
- <b>Shuffling Strategy</b>: Supports card pool shuffling strategies to increase randomness

<br>
<div align="left">
<a href="images/Prompt Card Selector1.jpg" target="_blank">
<img src="images/Prompt Card Selector1.jpg" alt="Prompt Card Selector1" width="30%"/>
</a>
<a href="images/Prompt Card Selector2.jpg" target="_blank">
<img src="images/Prompt Card Selector2.jpg" alt="Prompt Card Selector2" width="30%"/>
</a>
<a href="images/Prompt Card Selector3.jpg" target="_blank">
<img src="images/Prompt Card Selector3.jpg" alt="Prompt Card Selector3" width="30%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Prompt Gallery</b><br><code>PromptGallery</code></td>
<td>Prompt gallery node: loads an image-prompt library from a specified directory, then outputs the content of the <code>.txt</code> file that shares the same filename as the selected image. Useful for managing “image–prompt” pairs and quickly retrieving prompts in workflows.

<br>
<div align="left">
<a href="images/Prompt Gallery.jpg" target="_blank">
<img src="images/Prompt Gallery.jpg" alt="Prompt Gallery" width="60%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Prompt Preset - Single Choice</b><br><code>PromptPresetOneChoice</code></td>
<td>Provides 6 preset options, allowing users to conveniently switch between different presets. Suitable for saving commonly used prompt templates and quickly applying them to different scenarios.

<br>
<div align="left">
<a href="images/单选提示词预设.jpg" target="_blank">
<img src="images/单选提示词预设.jpg" alt="Single Choice Prompt Preset" width="45%"/>
</a>
</div></td>
</tr>
<tr>
<td><b>Prompt Preset - Multiple Choice</b><br><code>PromptPresetMultipleChoice</code></td>
<td>Supports selecting multiple presets simultaneously and merging them for output, with each preset having independent switch and comment functionality. Suitable for building complex combination prompts and flexibly controlling the enabled status of each part.

<br>
<div align="left">
<a href="images/多选提示词预设.jpg" target="_blank">
<img src="images/多选提示词预设.jpg" alt="Multiple Choice Prompt Preset" width="45%"/>
</a>
</div></td>
</tr>
<tr>
<td><b>Photography Prompt Generator</b><br><code>PhotographPromptGenerator</code></td>
<td>

Professional photography prompt generator with 32 customizable dimensions (camera, lens, lighting, pose, clothing, etc.). Features dual output modes - Tags for tag combinations and Template for formatted text. Supports custom user options and template editing helper.

<b>Features</b>:
- 32 professional photography dimensions including character, clothing, camera, lens, lighting, and more
- Dual output modes: Tags (comma-separated) and Template (formatted text)
- User-defined options support for flexible customization
- Built-in template editor helper for easy template creation and management
- Random selection option for creative inspiration

<div align="left">
<a href="images/Photograph Prompt Generator1.jpg" target="_blank">
<img src="images/Photograph Prompt Generator1.jpg" alt="Photography Prompt Generator" width="45%"/>
</a>
<a href="images/Photograph Prompt Generator2.jpg" target="_blank">
<img src="images/Photograph Prompt Generator2.jpg" alt="Photography Prompt Generator" width="45%"/>
</a>
<a href="images/Photograph Prompt Generator3.jpg" target="_blank">
<img src="images/Photograph Prompt Generator3.jpg" alt="Photography Prompt Generator" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Image Editing Presets</b><br><code>ImageEditingPresets</code></td>
<td>Provides a professional image editing preset library with various professional presets, offering stylized guidance for image generation, helping users quickly apply common artistic styles and effects.</td>
</tr>
<tr>
<td><b>Type Designer</b><br><code>TypeDesigner</code></td>
<td>Provides a visual interface for users to browse and select various font art styles (such as 3D, neon, metal, etc.), automatically providing corresponding preset prompts to facilitate artistic text creation.

<br>
<div align="left">
<a href="images/Type-Designer1.jpg" target="_blank">
<img src="images/Type-Designer1.jpg" alt="Type Designer 1" width="45%"/>
</a>
<a href="images/Type-Designer2.jpg" target="_blank">
<img src="images/Type-Designer2.jpg" alt="Type Designer 2" width="45%"/>
</a>
</div>
</td>
</tr>
</table>

### 🖼️ Image Processing Nodes

<table>
<tr>
<th width="30%">Node Name</th>
<th>Function Description</th>
</tr>
<tr>
<td><b>Get Image Sizes</b><br><code>GetImageSizes</code></td>
<td>Extracts the width and height information of the input image and displays the size preview in real-time on the node. Supports multiple image format inputs and provides accurate pixel size information.

<br>
<div align="left">
<a href="images/Get Image Sizes.jpg" target="_blank">
<img src="images/Get Image Sizes.jpg" alt="Get Image Sizes" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Image Aspect Ratio Settings</b><br><code>ImageAspectRatio</code></td>
<td>Intelligent image aspect ratio setting tool, supporting multiple preset modes and custom size configurations.

<b>Features</b>:
- <b>Multiple Preset Support</b>: Built-in dedicated aspect ratio presets for mainstream models such as Qwen, Qwen-Image 2.1, Flux, Flux.2, Flux2 klein, Wan, SDXL, LTX2.3, Z-image, Krea2, MiniMax H3 and MOSS-Image (Qwen-Image 2.1 covers all 7 official 2K-native ratios plus a 1K tier; MOSS-Image presets follow the official 1M / 1.5M / 2M pixel tiers; all dimensions are multiples of 16)
- <b>Custom Mode</b>: Supports completely custom width and height settings
- <b>Aspect Ratio Lock</b>: Provides aspect ratio locking function, automatically adjusting one dimension when modifying the other
- <b>Size Swap</b>: One-click swap width and height values for easy portrait/landscape orientation adjustment

<br>
<div align="left">
<a href="images/Image Aspect Ratio1.jpg" target="_blank">
<img src="images/Image Aspect Ratio1.jpg" alt="Image Aspect Ratio" width="80%"/>
</a>
</div>
<br>
<div align="left">
<a href="images/Image Aspect Ratio2.jpg" target="_blank">
<img src="images/Image Aspect Ratio2.jpg" alt="Image Aspect Ratio 2" width="80%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Image Scaler</b><br><code>ImageScaler</code></td>
<td>Provides multiple interpolation algorithms for image scaling, with the option to maintain the original aspect ratio. Supports high-quality image size adjustment, suitable for preprocessing or post-processing stages.

<br>
<div align="left">
<a href="images/图像缩放器.jpg" target="_blank">
<img src="images/图像缩放器.jpg" alt="Image Scaler" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Color Removal</b><br><code>ColorRemoval</code></td>
<td>Removes color from images, outputting grayscale images. Suitable for creating black and white effects or as a preprocessing step for specific image processing workflows.<br><br>
<a href="images/颜色移除节点展示.jpg" target="_blank"><img src="images/颜色移除节点展示.jpg" alt="Color Removal Node Display" width="400"/></a></td>
</tr>
<tr>
<td><b>Image Rotation Tool</b><br><code>ImageRotateTool</code></td>
<td>

Professional image rotation and flipping tool, supporting preset angles and custom angle rotation.

<b>Features</b>:
- <b>Preset Rotation</b>: Provides quick rotation options for 90°, 180°, 270°, and 360°
- <b>Flipping Function</b>: Supports vertical flipping and horizontal flipping operations
- <b>Custom Angle</b>: Supports precise angle rotation within the range of -360° to 360°
- <b>Canvas Handling</b>: Offers two processing modes: canvas extension or cropping blank areas
- <b>Batch Processing</b>: Supports simultaneous processing of multiple images

<br>
<div align="left">
<a href="images/Image Rotate Tool.jpg" target="_blank">
<img src="images/Image Rotate Tool.jpg" alt="Image Rotation Tool" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Image Preview/Compare</b><br><code>PreviewOrCompareImages</code></td>
<td>Multi-functional image preview and comparison node, supporting single image preview or side-by-side comparison display of two images. image_1 is a required input, image_2 is an optional input, and comparison mode is automatically enabled when two images are provided.

<b>Features</b>:
- <b>Dual Mode Intelligent Switching</b>: Automatically switches between preview or comparison mode based on single or dual image input
- <b>Interactive Comparison</b>: Displays a sliding divider on mouse hover for intuitive comparison

<br>
<div align="left">
<a href="images/图像对比.jpg" target="_blank">
<img src="images/图像对比.jpg" alt="Image Preview Comparison" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Image Format Converter</b><br><code>ImageFormatConverter</code></td>
<td>

Professional image format conversion tool, supporting batch conversion of multiple image formats, with intelligent format detection and advanced compression options.

<b>Supported Formats</b>:
- <b>Output Formats</b>: JPEG, PNG, WEBP, BMP, TIFF
- <b>Input Formats</b>: Automatically detects all common image formats

<b>Features</b>:
- <b>Batch Processing</b>: Supports folder batch conversion, automatically creating output directories
- <b>Quality Control</b>: Adjustable quality parameters from 1-100 for precise control of file size and image quality
- <b>Advanced Options</b>: Supports optimized compression, progressive encoding, and lossless compression
- <b>Intelligent Detection</b>: Format detection based on file content rather than extension
- <b>Detailed Reports</b>: Provides detailed information and statistics of the conversion process

<br>
<div align="left">
<a href="images/Image Format Converter.jpg" target="_blank">
<img src="images/Image Format Converter.jpg" alt="Image Format Converter" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Batch Image Loader</b><br><code>BatchLoadingOfImages</code></td>
<td>

Batch loads image files from a specified directory, supporting multiple sorting methods and loading controls.

<b>Features</b>:
- <b>Batch Loading</b>: Batch loads images from folders, supporting JPG, PNG, WEBP, JXL formats
- <b>Multiple Sorting</b>: Supports alphabetical, numerical, datetime ascending/descending sorting
- <b>Loading Control</b>: Supports setting start index and load count limits
- <b>Real-time Refresh</b>: Supports always reload mode for real-time access to latest files

<br>
<div align="left">
<a href="images/BatchLoadingOfImages.jpg" target="_blank">
<img src="images/BatchLoadingOfImages.jpg" alt="Batch Image Loader" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Image Indexer</b><br><code>ImageIndexer</code></td>
<td>
Labels upstream images as Img 1…Img N (图1…图N in the Chinese UI) and previews them as a numbered thumbnail grid on the node, while passing the images through unchanged. The numbering follows exactly the order downstream multi-image nodes expand, so a prompt can refer to "the third image" without guessing.

<b>Features</b>:
- <b>Order Alignment</b>: numbers each unit in the downstream expansion order, splitting batch tensors image by image
- <b>Pass-through Output</b>: output images are the same tensors as the input, so the node can be inserted anywhere before a consumer
- <b>Thumbnail Preview</b>: click a tile to open the zoom viewer; the first 32 images get previews while every image is still counted and passed through
- <b>Live Selection Preview</b>: with the Multimedia Loader upstream, changing the selection updates the grid right away without running the graph (marked "not run"); a run then switches it to the node's actual output. Reloading a workflow shows the last run's result first (keeping the saved height) until you change the selection

</td>
</tr>
<tr>
<td><b>Image Switch (Dual Mode)</b><br><code>ImageSwitchDualMode</code></td>
<td>Dual mode switcher supporting variable number of image inputs. Control the number of ports through the slider <code>inputcount</code> and click the button <code>Update inputs</code> to synchronously add/remove ports; in manual mode, select output by index (the <code>select_image</code> option automatically updates with <code>inputcount</code>); in automatic mode, output only when there is a unique non-empty input, and an error will be prompted if multiple non-empty inputs are detected. All newly added image input ports are non-mandatory, facilitating flexible comparison between different generation results or different processing paths.

<br>
<div align="left">
<a href="images/Image Switch Dual Mode.jpg" target="_blank">
<img src="images/Image Switch Dual Mode.jpg" alt="Image Switch (Dual Mode)" width="45%"/>
</a>
</div>
</td>
</tr>
</table>

### 🎞️ Film Post-Processing Nodes

<table>
<tr>
<th width="30%">Node Name</th>
<th>Function Description</th>
</tr>
<tr>
<td><b>Film Grain Effect</b><br><code>FilmGrain</code></td>
<td>

Adds realistic film grain effects to images, creating a classic film texture.
- <b>Dual Distribution Modes</b>: Supports Gaussian distribution (natural film noise) and uniform distribution (digital uniform noise)
- <b>Saturation Mixing</b>: Independently controls color/monochrome grain ratio, achieving smooth transitions from color film to black and white film

<br>
<div align="left">
<a href="images/胶片颗粒.jpg" target="_blank">
<img src="images/胶片颗粒.jpg" alt="Film Grain Effect" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Laplacian Sharpening</b><br><code>LaplacianSharpen</code></td>
<td>
Edge sharpening tool based on Laplacian operator, detecting image edges through second-order differentiation and enhancing details, suitable for detail enhancement in landscapes and portraits.

<br>
<div align="left">
<a href="images/拉普拉斯锐化.jpg" target="_blank">
<img src="images/拉普拉斯锐化.jpg" alt="Laplacian Sharpening" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>

<td><b>Sobel Sharpening</b><br><code>SobelSharpen</code></td>
<td>
Directional sharpening tool using Sobel operator, enhancing both horizontal and vertical edges through gradient calculation, suitable for scenes requiring emphasis on texture.

<br>
<div align="left">
<a href="images/索贝尔锐化.jpg" target="_blank">
<img src="images/索贝尔锐化.jpg" alt="Sobel Sharpening" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>USM Sharpening</b><br><code>USMSharpen</code></td>
<td>
Uses classic USM sharpening technology to enhance details, providing natural sharpening processing for target images.

<br>
<div align="left">
<a href="images/USM锐化.jpg" target="_blank">
<img src="images/USM锐化.jpg" alt="USM Sharpening" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Color Matching</b><br><code>ColorMatchToReference</code></td>
<td>
Intelligent color matching tool that can apply the color tone style of a reference image to a target image, achieving professional-level color unification.

<br>
<div align="left">
<a href="images/颜色匹配.jpg" target="_blank">
<img src="images/颜色匹配.jpg" alt="Color Matching" width="45%"/>
</a>
</div>
</td>
</tr>
</table>

### 🎬 Video Processing Nodes

<table>
<tr>
<th width="30%">Node Name</th>
<th>Function Description</th>
</tr>
<tr>
<td><b>Video Frame Extractor</b><br><code>VideoFrameExtractor</code></td>
<td>
Professional video frame extraction tool that supports extracting a specified number of frames or frames at intervals from video files, suitable for video analysis, preview, and subsequent processing.

<b>Features</b>:
- <b>Dual Extraction Modes</b>: Supports extraction by count (even distribution) and extraction by interval
- <b>Start Frame Setting</b>: Can specify which frame to start extracting from
- <b>Flexible Configuration</b>: Supports setting maximum extraction count and interval frames
- <b>Batch Output</b>: Extracted frames are output as an image list, directly connectable to subsequent image processing nodes
- <b>Optional Save</b>: Supports saving extracted frames to a specified directory

<b>Use Cases</b>:
- Video keyframe extraction and preview
- Preparing video frame input for AI vision models
- Video content analysis and processing

<br>
<div align="left">
<a href="images/Video Frame Extractor.jpg" target="_blank">
<img src="images/Video Frame Extractor.jpg" alt="Video Frame Extractor" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Video Preview</b><br><code>VideoPreview</code></td>
<td>

Plays an incoming video directly on the node, so results can be previewed without saving to the output directory first.

<b>Core Features</b>:
- <b>In-Node Playback</b>: the video plays right in the node panel, skipping the output directory
- <b>Lossless Packaging</b>: the video is only remuxed losslessly into the temp directory and reused across runs; frames are never decoded
- <b>Pass-through</b>: the output socket returns the video unchanged, so it can feed downstream nodes such as Save Video

</td>
</tr>
</table>

### 🎵 Music-Related Nodes

<table>
<tr>
<th width="30%">Node Name</th>
<th>Function Description</th>
</tr>
<tr>
<td><b>Suno Lyrics Generator</b><br><code>SunoLyricsGenerator</code></td>
<td>
Assembles the user's description with theme, lyrics language, vocal arrangement, lyrics style, mood and genre choices (randomizable) into one structured songwriting instruction that carries the Suno section-tag format rules, ready to feed an LLM node or Suno. The node itself runs fully offline.

<br>
<div align="left">
<a href="images/Lyrics Generator.jpg" target="_blank">
<img src="images/Lyrics Generator.jpg" alt="Suno Lyrics Generator" width="45%"/>
</a>
</div>

</td>
</tr>
<tr>
<td><b>Suno Song Style Prompt Generator</b><br><code>SunoSongStylePromptGenerator</code></td>
<td>
Professional song style prompt generation tool that combines user preferences and musical elements to generate structured Suno-style prompts for quickly building style-consistent songs.

<br>
<div align="left">
<a href="images/Song Style Prompt Generator.jpg" target="_blank">
<img src="images/Song Style Prompt Generator.jpg" alt="Suno Song Style Prompt Generator" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>Audio Duration Calculator</b><br><code>AudioDuration</code></td>
<td>
Calculates audio file duration information, outputting seconds, formatted time, and milliseconds.

<b>Features</b>:
- <b>Formatted Time</b>: outputs HH:MM:SS.mmm, ready to paste into a prompt or file name
- <b>Auto-Adaptation</b>: handles audio tensors of different dimensions and computes duration precisely from the sample rate
</td>
</tr>
</table>

### 🧊 Latent Nodes

<table>
<tr>
<th width="30%">Node Name</th>
<th>Function Description</th>
</tr>
<tr>
<td><b>Latent Switch (Dual Mode)</b><br><code>LatentSwitchDualMode</code></td>
<td>Dual mode switcher supporting variable number of latent inputs. Control the number of ports through the slider <code>inputcount</code> and click the button <code>Update inputs</code> to synchronously add/remove ports; in manual mode, select output by index (the <code>select_channel</code> option automatically updates with <code>inputcount</code>); in automatic mode, output only when there is a unique non-empty input, and an error will be prompted if multiple non-empty inputs are detected. All newly added latent input ports are non-mandatory, suitable for flexible switching and comparative experiments between different generation paths.

<br>
<div align="left">
<a href="images/Latent Switch Dual Mode.jpg" target="_blank">
<img src="images/Latent Switch Dual Mode.jpg" alt="Latent Switch (Dual Mode)" width="45%"/>
</a>
</div>
</td>
</tr>
</table>

### 📦 Loader Nodes

<table>
<tr>
<th width="30%">Node Name</th>
<th>Function Description</th>
</tr>
<tr>
<td><b>Multimedia Loader</b><br><code>MultimediaAdvancedLoader</code></td>
<td>

Browse the images, videos and audio in the `input` directory as a thumbnail grid and pick the assets to send downstream.

<b>Core Features</b>:
- <b>Three Asset Types</b>: Images, videos and audio browsed and selected in a single grid
- <b>Load Mode</b>: Loads everything by default and outputs the MiniMax H3 media bundle port; switching to "Images only" hides audio and video and outputs the image port alone
- <b>Output Modes</b>: "Click to select" outputs only the picked items, "Smart numbering" outputs all of them in numbered order
- <b>Downstream Wiring</b>: the media output docks directly with the LM Studio node and the Image Understanding Online node

</td>
</tr>
<tr>
<td><b>LoRA Stack Loader</b><br><code>LoraStackLoader</code></td>
<td>

Manage several LoRAs as a list and apply them in row order to MODEL.

<b>Core Features</b>:
- <b>Row Management</b>: drag to reorder, enable/disable, ◀▶ strength steps of 0.05, direct weight input (-50 to 50), click a row to select it, replace a model from the row's More panel, delete a row
- <b>Model Picker</b>: search, thumbnails and a large preview, with a placeholder when no preview exists
- <b>Trigger Words</b>: each row stores preset trigger words under More settings; saved with the workflow, copyable, and never exposed as an output port
- <b>Presets</b>: save the whole stack as a preset and reload it anytime
- <b>Fresh Read Every Execution</b>: no cross-execution weight cache, so an updated file never keeps applying stale weights; a repeated LoRA is read once per run and kept as a single row
- <b>Official Equivalence</b>: every row goes through <code>get_full_path_or_raise</code> → <code>load_torch_file</code> → <code>load_lora_for_models</code>, matching the MODEL output of chained official LoraLoader nodes

</td>
</tr>
</table>

### 🤖 AI Assistant Nodes

<table>
<tr>
<th width="30%">Node Name</th>
<th>Function Description</th>
</tr>
<tr>
<td><b>Image Understanding Online</b><br><code>ImageUnderstandingOnline</code></td>
<td>
Image understanding node that calls any OpenAI-compatible online multimodal endpoint. Configure several platforms in the communication settings and switch between them right on the node.

<b>Supported Platforms</b>:
- <b>Any OpenAI-compatible endpoint (custom configurations)</b>

<b>Core Features</b>:
- <b>Cloud Deployment</b>: No local GPU required, calls cloud models through API
- <b>Multiple Platforms</b>: Up to 6 custom configurations, switched from a dropdown on the node
- <b>Single & Multiple Images</b>: Takes one image or an image list; multiple images are all merged into a single request (consistent with the LM Studio node), ideal for difference analysis where every image must be seen at once
- <b>Text Prompt Port</b>: Dock any string output and the linked text replaces the entire prompt section (preset, user prompt and system prompt are all ignored); the panel's Prompt card locks as a whole and shows "Prompt supplied by the text port" (consistent with the LM Studio node)
- <b>Text-only Capable</b>: With no image docked it automatically runs as a plain text node against the same platform, honouring the prompt and sampling parameters
- <b>Template Categories</b>: Prompt templates shared with the LM Studio node support single-level categories — filter, create, rename and delete them
- <b>Batch Processing</b>: The same batch capability as the LM Studio node — reads images only from the folder set in "Batch Folder", sends one request per image and writes each result to a <code>.txt</code> next to the image. "Skip Existing" skips images that already have a txt file, which makes resuming easy. The read mode is switchable in the settings dialog between "Recursive Mode" (traverse all subfolders at once) and "Sequential Mode" (process folders in order by name, with progress persisted so an interrupted run continues from where it stopped). The path can be set by dragging a folder onto the field, clicking "Set" to pick a directory, or typing it manually
</td>
</tr>
<tr>
<td><b>LLM Extra Options</b><br><code>LLMExtraOptions</code></td>
<td>
Provides detailed output control options for LLM nodes, including advanced configuration parameters such as character information, lighting analysis, camera angles, and watermark detection.

<br>
<div align="left">
<a href="images/LLM额外选项.jpg" target="_blank">
<img src="images/LLM额外选项.jpg" alt="LLM Extra Options" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>LM Studio Node</b><br><code>LMStudioNode</code></td>
<td>
A vision understanding node that connects to a local LM Studio server, supporting image analysis and text generation. Enables private image analysis using locally deployed models without cloud APIs.

<b>Prerequisites</b>:
- Install <b>LM Studio</b> software, download from: [https://lmstudio.ai](https://lmstudio.ai)
- Download and load a vision-capable model in LM Studio (e.g., Qwen2-VL, Llama-Vision, etc.)
- Enable the local server feature in LM Studio (default port 1234)

<b>Core Features</b>:
- <b>Local Deployment</b>: Connect to local LM Studio server, no cloud API key required
- <b>Multiple Preset Templates</b>: Supports tag backtracking, detailed description, creative writing, and more
- <b>Template Categories</b>: Prompt templates can be grouped into single-level categories — filter, create, rename and delete categories from the settings dialog
- <b>Output Language Control</b>: Supports Chinese, English, and bilingual output
- <b>Auto Model Discovery</b>: Automatically fetches loaded model list from LM Studio
- <b>Model Refresh</b>: One-click refresh button to reload model list when display issues occur
- <b>Multi-Image Input</b>: a single image socket on the canvas — dock the Multimedia Loader's image output (an image list) and it becomes one multi-image prompt; the count is decided upstream
- <b>Text Prompt Port</b>: dock any string output to it and the linked text becomes the prompt — the whole prompt section is disabled
- <b>Model Unload Switch</b>: tick <code>unload_model</code> to unload the loaded model automatically after inference and free the VRAM
- <b>Inference Log Panel</b>: Displays real-time inference logs with current run information only
- <b>Visual Settings</b>: Provides status settings interface for easy parameter configuration

<br>
<div align="left">
<a href="images/LM Studio Node.jpg" target="_blank">
<img src="images/LM Studio Node.jpg" alt="LM Studio Node" width="45%"/>
</a>
</div>
</td>
</tr>
<tr>
<td><b>System Prompt Loader</b><br><code>SystemPromptLoader</code></td>
<td>Dynamically loads system-level prompts from preset folders, with optional merging with user input. Suitable for managing and applying complex system prompt templates, improving the consistency and quality of generation results.<br><br>
<div align="left">
<a href="images/System Prompt Loader.jpg" target="_blank">
<img src="images/System Prompt Loader.jpg" alt="System Prompt Loader" width="45%"/>
</a>
</div>
</td>
</tr>
</table>

### ⚙️ Toolkit Nodes

<table>
<tr>
<th width="30%">Node Name</th>
<th>Function Description</th>
</tr>
<tr>
<td><b>Resource Cleaner</b><br><code>ResourceCleaner</code></td>
<td>

System resource cleanup tool providing independent controls for clearing RAM, VRAM, and cache, allowing selective release of system resources.

<b>Features</b>:
- <b>Independent Control</b>: Three cleanup functions equipped with independent switches, can be used individually or in combination
- <b>Detailed Report</b>: Outputs detailed report of the cleanup process for monitoring resource release

</td>
</tr>
<tr>
<td><b>Reserved VRAM Setter</b><br><code>ReservedVRAMSetter</code></td>
<td>

Professional GPU VRAM reservation management tool for controlling ComfyUI's VRAM usage strategy, effectively preventing Out-of-Memory (OOM) errors and improving workflow stability. Supports both manual and automatic modes, with the automatic mode intelligently calculating appropriate VRAM reservation amounts based on current GPU usage.

<b>Features</b>:
- <b>Dual Mode Support</b>: Manual mode sets fixed VRAM reservation, automatic mode intelligently adjusts based on current GPU usage
- <b>Smart Cleanup</b>: Supports automatic GPU VRAM cleanup before setting, releasing unused resources
- <b>Automatic Limits</b>: Automatic mode can set maximum reservation limits to prevent excessive reservations affecting other applications
- <b>Seed Control</b>: Built-in random seed management to ensure workflow consistency
- <b>Real-time Feedback</b>: Provides detailed VRAM setting logs for debugging and optimization

<br>
<div align="left">
<img src="images/Reserved VRAM Setter.jpg" alt="Reserved VRAM Setter" width="45%"/>
</div>
</td>
</tr>
<tr>
<td><b>Text Encoder Release</b><br><code>TextEncoderRelease</code></td>
<td>

Text encoder release tool that unloads the connected CLIP (text encoder) from VRAM before sampling, freeing memory up front for workflows where the text encoder is large and sampling needs the full VRAM budget.

<b>Features</b>:
- <b>Execution Dependency</b>: wire the conditioning sockets so the encoder is released only after text encoding has finished
- <b>Chain Pass-through</b>: the model socket is returned unchanged, so the node can sit right before the sampler
- <b>Runs Every Prompt</b>: bypasses node caching so the release always happens
- <b>Switches</b>: can be disabled entirely, or run silently without log output

</td>
</tr>
<tr>
<td><b>Integer Node</b><br><code>IntNode</code></td>
<td>

Outputs a configurable integer value for unified parameter control. Supports integer input in the range of -2147483648 to 2147483647, suitable for scenarios requiring precise numerical control.

<br>
<div align="left">
<img src="images/IntNode.jpg" alt="Integer Node" width="45%"/>
</div>
</td>
</tr>
<tr>
<td><b>Group Switch Manager</b><br><code>GroupSwitchManager</code></td>
<td>

Visual group switch management tool that automatically detects all groups in the workflow, provides one-click enable/disable functionality, supports color filtering, title matching, drag-and-drop sorting, and group linkage configuration.

<b>Core Features</b>:
- <b>Smart Filtering</b>: Supports filtering groups by color or title keywords
- <b>Drag Sorting</b>: Customize group display order
- <b>Linkage Config</b>: Configure linkage rules between groups for switch linkage effects
- <b>Quick Navigation</b>: Click arrow to quickly navigate to the corresponding group position
- <b>Dual Mode Support</b>: Supports Disable Mode and Bypass Mode

<br>
<div align="left">
<a href="images/Group Switch Manager1.jpg" target="_blank">
<img src="images/Group Switch Manager1.jpg" alt="Group Switch Manager - Main Interface" width="30%"/>
</a>
<a href="images/Group Switch Manager2.jpg" target="_blank">
<img src="images/Group Switch Manager2.jpg" alt="Group Switch Manager - Settings Dialog" width="30%"/>
</a>
<a href="images/Group Switch Manager3.jpg" target="_blank">
<img src="images/Group Switch Manager3.jpg" alt="Group Switch Manager - Linkage Config" width="30%"/>
</a>
</div>
</td>
</tr>
</table>
---

## 🚀 Installation Methods

### 📦 Method 1: Install via ComfyUI Manager (Recommended)

1. Install [ComfyUI Manager](https://github.com/ltdrdata/ComfyUI-Manager)
2. Select "Install Custom Nodes" in the Manager menu
3. Search for `zhiai_nodes_comfyui` and click the "Install" button
4. Restart ComfyUI after installation completes

### 🔧 Method 2: Install via Git

Navigate to the `custom_nodes` directory of ComfyUI and run:

```bash
git clone https://github.com/ZhiHui6/zhiai_nodes_comfyui.git
```

Restart ComfyUI to use the nodes.

### 📁 Method 3: Manual Installation

1. Download the ZIP file of this repository and extract it
2. Copy the entire `zhiai_nodes_comfyui` folder to the `custom_nodes` directory of ComfyUI
3. Restart ComfyUI

---

### 🧭 Where The Nodes Live

After installation every node sits under the **Zhi.AI** top-level category of the right-click menu, split into Text, Generator, Image, MovieTools, Video, Loaders, Latent, Toolkit, Audio, AI Assistant submenus. These labels follow the ComfyUI interface language. Restart ComfyUI after installing or updating the pack so the nodes get registered.

### 🔑 First-run Configuration

- **Network access**: translation, AI expansion and online image understanding call remote endpoints; the text, image and latent tools run entirely locally.
- **LLM platform keys**: open the ComfyUI **Settings** panel → **ZhiAI** → click "📝 API Settings" to fill in API Key, Base URL and model name for OpenAI, Google, ZhipuAI, DeepSeek, SiliconFlow, MoonshotAI, MiniMax, Alibaba, VolcEngine, Tencent, ModelScope, NVIDIA and any custom endpoint, with a connection test included. The Tag Selector's AI expansion reads this configuration directly (`platform` set to auto picks whichever profile is available), and Image Understanding Online shares the same storage for its endpoint profiles.
- **Translation keys**: click the "⚙️ Config Management" button on the Multi-Platform Translation node to enter the credentials of Baidu, Alibaba Cloud, Youdao, Zhipu AI and Google separately.
- **LM Studio**: run LM Studio locally with its server enabled (default port 1234); see the Prerequisites of that node above.

### 📋 Dependencies

Dependencies are installed automatically when you install through ComfyUI Manager; for a manual setup run:

```bash
pip install -r requirements.txt
```

What each dependency is used for:

- **opencv-python**: Color Removal, Image Rotate Tool, Video Frame Extractor, LM Studio Node
- **scikit-image**: Color Match To Reference
- **openai**: Image Understanding Online
- **nvidia-ml-py**: Reserved VRAM Setter (requires an NVIDIA driver)
- **cryptography**: decryption of the built-in data pack used by the Tag Selector character extractor

## 📄 License

This project is open source under the **GPL-3.0** license; see [LICENSE](LICENSE) for the full terms.

## 🤝 Contributing

Contributions of every kind are welcome:

- 🐛 [Report a bug](https://github.com/ZhiHui6/zhiai_nodes_comfyui/issues/new?labels=bug)
- 💡 [Suggest a feature](https://github.com/ZhiHui6/zhiai_nodes_comfyui/issues/new?labels=enhancement)
- 📚 Documentation improvements and 💻 code contributions: open a [Pull Request](https://github.com/ZhiHui6/zhiai_nodes_comfyui/compare)

If you have any ideas or suggestions, please feel free to submit an Issue or Pull Request.
