# 03. Computer Vision & Image Processing Pipelines

## 1. Overview
The Satellite AI backend incorporates real Computer Vision algorithms implemented with **OpenCV (cv2)**, **NumPy**, and **Pillow (PIL)**. The system transforms raw dual-temporal satellite captures into calibrated spatial change maps, classification masks, and quantitative area analytics.

---

## 2. Core Image Ingestion & Standardization

Before processing, raw satellite inputs pass through standardization:
1. **Format Harmonization**: Supports PNG, JPEG, TIFF, and WebP formats.
2. **Dimension Resampling**:
   $$\text{target\_w} = \max(400, \min(w_1, w_2, 1200))$$
   $$\text{target\_h} = \max(400, \min(h_1, h_2, 1200))$$
   Images are resized via `cv2.INTER_AREA` interpolation to maintain sub-pixel structural fidelity.
3. **Noise Attenuation**: 2D Gaussian Filtering with kernel size $(5, 5)$ and $\sigma = 0$:
   $$G(x, y) = \frac{1}{2\pi\sigma^2} e^{-\frac{x^2+y^2}{2\sigma^2}}$$

---

## 3. Computer Vision Pipelines

### 3.1 Dual-Temporal Change Detection Pipeline (`generate_change_map_cv`)

The change detection pipeline isolates structural deviations between $I_{\text{before}}$ and $I_{\text{after}}$:

```
[Before Image] ──> [Grayscale + Gaussian Blur] ──┐
                                                 ├──> [Absolute Differencing] ──> [Sobel Gradient Blend]
[After Image]  ──> [Grayscale + Gaussian Blur] ──┘                                      │
                                                                                        ▼
[Contour HUD Stamping] <── [Jet Colormap Blending] <── [Morphological Opening/Closing] <── [Binary Threshold]
```

1. **Grayscale Conversion**:
   $$Y = 0.299R + 0.587G + 0.114B$$
2. **Absolute Difference Matrix**:
   $$D_{\text{abs}}(x, y) = |I_{\text{before}}(x, y) - I_{\text{after}}(x, y)|$$
3. **Sobel Gradient Hybridization (AI Mode)**:
   Computes horizontal and vertical spatial derivatives:
   $$G_x = \frac{\partial I}{\partial x}, \quad G_y = \frac{\partial I}{\partial y}$$
   $$D_{\text{sobel}} = \text{clip}(|\nabla I_{\text{before}} - \nabla I_{\text{after}}|, 0, 255)$$
   $$D_{\text{fused}} = 0.6 \cdot D_{\text{abs}} + 0.4 \cdot D_{\text{sobel}}$$
4. **Morphological Filtering**:
   Elliptical structuring element $B_{\text{ellipse}}$ of radius $5\times 5$:
   $$M = (D_{\text{binary}} \bullet B) \circ B$$
   - **Closing ($\bullet$)**: Bridges small gaps in continuous features (roads, buildings).
   - **Opening ($\circ$)**: Eliminates isolated sensor speckle and atmospheric haze noise.
5. **Heatmap Synthesis & Blending**:
   $$H = \text{applyColorMap}(D_{\text{fused}}, \text{COLORMAP\_JET})$$
   $$I_{\text{blended}} = 0.45 \cdot I_{\text{after}} + 0.55 \cdot H \quad (\forall (x,y) \in M > 0)$$
6. **Contour Extraction & Bounding Boxes**:
   `cv2.findContours(M, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)` flags change clusters where $\text{Area} > 120 \text{ px}$.

---

### 3.2 Urban Growth & Sprawl Analysis (`generate_urban_growth_cv`)

Detects new concrete infrastructure, road extensions, and building developments:
1. **HSV Color Space Transformation**:
   $$H, S, V = \text{RGB\_to\_HSV}(I)$$
   - Concrete, tarmac, and buildings exhibit characteristic low saturation ($S$) and elevated brightness value ($V$).
2. **Saturation & Value Differencing**:
   $$D_V = |V_{\text{before}} - V_{\text{after}}|, \quad D_S = |S_{\text{before}} - S_{\text{after}}|$$
   $$D_{\text{urban}} = 0.6 \cdot D_V + 0.4 \cdot D_S$$
3. **Rectangular Morphological Expansion**:
   Structuring kernel $B_{\text{rect}}$ of size $7\times 7$ to merge rectangular geometric building footprints.
4. **Expansion Percentage**:
   $$\text{Expansion } \% = \frac{\sum M_{\text{urban}}(x, y)}{\text{Total Pixels}} \times 100$$

---

### 3.3 Flood Inundation & SAR Analysis (`generate_flood_analysis_cv`)

Identifies standing water, submerged terrain, and river overflow:
1. **Water Spectral Index Approximation (NDWI Proxy)**:
   Water surfaces strongly absorb near-infrared and red wavelengths while reflecting green/blue.
   $$\text{Water Proxy} = \frac{G - R}{G + R + \epsilon}$$
2. **Inundation Thresholding**:
   Extracts dark specular reflection regions characteristic of standing water sheets.
3. **Parametric Impact Assessment**:
   Calculates estimated flood depth, damaged structures count, and affected population proportional to inundation area:
   $$\text{Damaged Buildings} \approx \text{Inundation Area (ha)} \times \rho_{\text{density}}$$

---

### 3.4 Forest Canopy & Deforestation Pipeline (`generate_forest_monitoring_cv`)

Quantifies tree canopy depletion and agricultural encroachment:
1. **Vegetation Index Approximation (NDVI Proxy)**:
   Extracts high-reflectance green channel dominance over blue/red background soil:
   $$\text{NDVI Proxy} = \frac{2G - R - B}{2G + R + B + \epsilon}$$
2. **Canopy Depletion Mask**:
   $$\Delta \text{Canopy} = \text{NDVI}_{\text{before}} - \text{NDVI}_{\text{after}}$$
   Positive values denote tree cover loss; negative values identify afforestation/new plantation.
3. **Risk Scoring**:
   $$\text{Risk Level} = \begin{cases}
   \text{Critical} & \text{if Loss } > 15\% \\
   \text{High} & \text{if Loss } > 8\% \\
   \text{Medium} & \text{if Loss } > 3\% \\
   \text{Low} & \text{otherwise}
   \end{cases}$$

---

## 4. Automated HUD Bar Rendering

Every synthesized change map receives an embedded telemetry HUD banner:
- Top bar dimensions: $48 \text{ px} \times \text{target\_w}$
- Background: Deep cosmic slate RGB $(15, 20, 30)$
- Header Text: Algorithm type, percentage delta, changed pixel count, resolution stamp
- Font: `cv2.FONT_HERSHEY_SIMPLEX` with anti-aliasing (`cv2.LINE_AA`) and cyan glowing text RGB $(0, 240, 255)$.
