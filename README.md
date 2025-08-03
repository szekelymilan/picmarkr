<p align="center">
  <img src="src/logo.svg" width="200px" align="center" alt="PicMarkr logo" />
  <h1 align="center">PicMarkr</h1>
  <p align="center">
    Batch Image Watermarker Tool
  </p>
</p>
<br/>

## ✨ What is PicMarkr?

PicMarkr is a minimal, open source batch image watermarking tool for the web.
Easily overlay your organization's logo, a watermark, or a gradient on multiple images at once.
**No install, no upload, no data leaves your computer.**
Perfect for social media teams, creators, or anyone who needs fast, privacy-first batch logo overlays!

## 🚀 Features

- 📷 **Batch Processing:** Upload and edit multiple images at once
- ✂️ **Flexible Cropping:** Fit images to preconfigured size (by default 1080×1350) or keep original size
- 🖍️ **Logo Overlay:** Add your own PNG or SVG logo in any corner
- 🎨 **Gradient Layer:** Optional fade-to-transparent overlay for better logo readability
- 🖱️ **Drag-to-Crop:** Precisely adjust image positioning in the crop frame
- 👀 **Live Preview:** See exactly what you will get before exporting
- 📦 **Export Options:** Download images as PNGs or all at once as a ZIP file
- 🔒 **Privacy by Design:** All processing happens in your browser — images never leave your device

## 🖥️ Running Locally

To use all features (especially **downloading images from the canvas**), you must run PicMarkr from a local server.

> **Why?**
> Most browsers (including Chrome and Firefox) restrict saving files generated from a canvas when running directly from `file://` for security reasons. Running a local server avoids this issue.

### How to Run a Simple Local Server

You do not need anything fancy — just Python (preinstalled on most systems):

**For Python 3:**

In the `src` folder, run:

```sh
python3 -m http.server 8000
```

Then open your browser and go to:
[http://localhost:8000](http://localhost:8000)

You can now use all features of PicMarkr, including ZIP and image downloads!

## 📝 Usage

- **Upload Image(s):** Click "Upload Image(s)" and select one or more files
- **Adjust Settings:**
  - "Keep original size" or fit to preconfigured size
  - "Add gradient layer" (optional)
  - Logo corner position (top/bottom, left/right)
- **Drag Image** in the preview panel to adjust crop
- **Preview:** Use the arrow buttons to switch between images
- **Download:** Click "Download Image(s)" to save a single image or a ZIP with all processed files

## 🤔 Why PicMarkr?

- **No installation** needed
- Works **100% offline**
- **Open source** and auditable
- **Does not upload or track** your images
- **Clean UI**, simple workflow

## 🛠️ Development

- **Built with:** HTML5, CSS, JavaScript (no frameworks)
- **Dependencies:**
  - [JSZip](https://stuk.github.io/jszip/) – for ZIP file creation 📦
  - [FileSaver.js](https://github.com/eligrey/FileSaver.js) – for cross-browser file downloads 💾

## 🖼️ Logo

Default logo is in `logo.svg` — you are encouraged to swap in your own!

## 🐞 Troubleshooting

- **If "Download" does not work:**
  Make sure you opened PicMarkr through `http://localhost:8000` (or your chosen local server), not as a `file://` path.
- **Why?**
  This is a security feature in all major browsers.

## 📄 License

[MIT License](LICENSE)

## 🤝 Contributing

Pull requests and suggestions are welcome!
See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

**PicMarkr** is open source, privacy-first, and always free.
If you like it, ⭐️ star this repo or share it!

---

_No data leaves your computer. No ads. No nonsense._
