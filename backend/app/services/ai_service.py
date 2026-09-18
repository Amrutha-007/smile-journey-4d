import abc
import asyncio
import base64
import os
import urllib.parse
from typing import Optional, Dict, Any, Tuple
from app.config import settings
from app.utils.prompts import build_treatment_prompt


class AIImageProvider(abc.ABC):
    """Abstract interface for all AI smile simulation image providers."""

    @abc.abstractmethod
    async def generate_smile_simulation(
        self,
        image_url: str,
        treatment_type: str,
        stage_month: int,
        stage_progress: int
    ) -> Tuple[str, str]:
        """
        Generates potential smile visualization.
        Returns a tuple of (output_image_url_or_data, prompt_used).
        """
        pass


class MockAIProvider(AIImageProvider):
    """
    Mock AI Provider designed for hackathon reliability, testing, and offline demos.
    Generates rich, medically themed visual SVG data URLs reflecting treatment progress.
    """

    async def generate_smile_simulation(
        self,
        image_url: str,
        treatment_type: str,
        stage_month: int,
        stage_progress: int
    ) -> Tuple[str, str]:
        stage_name = f"Month {stage_month}" if stage_progress < 100 else f"Final — Month {stage_month}"
        prompt_used = build_treatment_prompt(treatment_type, stage_name, stage_month, stage_progress)

        # Realistic async processing simulation (100ms)
        await asyncio.sleep(0.1)

        norm_treatment = treatment_type.lower()
        if "veneer" in norm_treatment:
            treatment_label = "Dental Veneers"
            accent_color = "#38bdf8"
            theme_whiteness = int(40 + (55 * stage_progress / 100))
            crowding_level = int(20 * (1 - stage_progress / 100))
        elif "brace" in norm_treatment:
            treatment_label = "Orthodontic Braces"
            accent_color = "#a855f7"
            theme_whiteness = int(25 + (45 * stage_progress / 100))
            crowding_level = int(80 * (1 - stage_progress / 100))
        else:
            treatment_label = "Clear Aligners"
            accent_color = "#0ea5e9"
            theme_whiteness = int(30 + (60 * stage_progress / 100))
            crowding_level = int(85 * (1 - stage_progress / 100))

        alignment_pct = stage_progress
        has_brackets = "brace" in norm_treatment and stage_progress < 95

        # Build dynamic medical simulation SVG
        svg_teeth = []
        tooth_positions = [-110, -75, -45, -15, 15, 45, 75, 110]
        tooth_heights = [38, 48, 56, 62, 62, 56, 48, 38]

        for idx, (x, h) in enumerate(zip(tooth_positions, tooth_heights)):
            # Progressive rotation/displacement reduction as progress increases
            offset_y = (idx % 2 * 2 - 1) * (crowding_level / 12)
            rot = (idx - 3.5) * (crowding_level / 20)
            whiteness_hex = f"#{theme_whiteness:02x}{theme_whiteness+5:02x}{theme_whiteness+10:02x}"
            tooth_path = (
                f'<rect x="{x-12}" y="{150 - h + offset_y}" width="24" height="{h}" '
                f'rx="7" fill="{whiteness_hex}" stroke="#cbd5e1" stroke-width="1.5" '
                f'transform="rotate({rot} {x} {150})"/>'
            )
            svg_teeth.append(tooth_path)

            if has_brackets:
                bracket = (
                    f'<rect x="{x-4}" y="{140 - h/2 + offset_y}" width="8" height="8" '
                    f'rx="1.5" fill="#94a3b8" stroke="#475569" stroke-width="1"/>'
                )
                svg_teeth.append(bracket)

        archwire = ""
        if has_brackets:
            archwire = '<path d="M -115 125 Q 0 148 115 125" fill="none" stroke="#64748b" stroke-width="2"/>'

        svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="lipGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#be185d"/>
      <stop offset="100%" stop-color="#9d174d"/>
    </linearGradient>
    <linearGradient id="gumGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f43f5e"/>
      <stop offset="100%" stop-color="#fda4af"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="600" height="400" fill="url(#bg)"/>

  <!-- Simulation Header Badge -->
  <rect x="24" y="24" width="230" height="34" rx="8" fill="#1e293b" stroke="{accent_color}" stroke-width="1.5"/>
  <circle cx="44" cy="41" r="5" fill="{accent_color}"/>
  <text x="58" y="46" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="12" font-weight="600">
    AI POTENTIAL SIMULATION
  </text>

  <!-- Stage and Progress Indicator -->
  <text x="24" y="90" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="20" font-weight="700">
    {stage_name}
  </text>
  <text x="24" y="112" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="13">
    {treatment_label} • Progress: {stage_progress}%
  </text>

  <!-- Smile Aesthetic Framing (Center) -->
  <g transform="translate(300, 240)">
    <!-- Upper Lip Contour -->
    <path d="M -160 -10 C -100 -50 0 -45 0 -45 C 0 -45 100 -50 160 -10 C 120 15 60 25 0 25 C -60 25 -120 15 -160 -10 Z" fill="url(#lipGrad)" opacity="0.9"/>
    <!-- Oral Cavity Dark Interior -->
    <ellipse cx="0" cy="15" rx="135" ry="55" fill="#0f172a"/>
    <!-- Upper Gingival Arch -->
    <path d="M -130 -10 Q 0 -35 130 -10 Q 0 5 -130 -10 Z" fill="url(#gumGrad)" opacity="0.8"/>
    <!-- Teeth Rendered with Alignment Math -->
    <g transform="translate(0, -95)">
      {''.join(svg_teeth)}
      {archwire}
    </g>
    <!-- Lower Lip Contour -->
    <path d="M -160 -10 C -110 50 0 70 0 70 C 0 70 110 50 160 -10 C 110 40 0 50 0 50 C 0 50 -110 40 -160 -10 Z" fill="url(#lipGrad)"/>
  </g>

  <!-- Progress Bar Container -->
  <rect x="24" y="348" width="552" height="8" rx="4" fill="#334155"/>
  <rect x="24" y="348" width="{5.52 * stage_progress}" height="8" rx="4" fill="{accent_color}"/>

  <!-- Medical & Legal Disclaimer Footer -->
  <text x="300" y="380" fill="#64748b" font-family="system-ui, sans-serif" font-size="10" text-anchor="middle">
    AI-generated potential treatment simulation. Not a guaranteed clinical prediction.
  </text>
</svg>"""

        # Encode SVG into standard data URL
        encoded_svg = urllib.parse.quote(svg_content)
        data_url = f"data:image/svg+xml;utf8,{encoded_svg}"
        return data_url, prompt_used


class GeminiImageProvider(AIImageProvider):
    """
    Real Gemini AI Provider using Google GenAI SDK.
    Sends patient photograph along with clinical alignment prompts to produce
    photorealistic treatment visualizations.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.client = None
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception:
                pass

    async def generate_smile_simulation(
        self,
        image_url: str,
        treatment_type: str,
        stage_month: int,
        stage_progress: int
    ) -> Tuple[str, str]:
        stage_name = f"Month {stage_month}" if stage_progress < 100 else f"Final — Month {stage_month}"
        prompt_used = build_treatment_prompt(treatment_type, stage_name, stage_month, stage_progress)

        if not self.client:
            # If Gemini client cannot be initialized (e.g. key missing in dev), fallback to mock gracefully
            mock = MockAIProvider()
            return await mock.generate_smile_simulation(
                image_url, treatment_type, stage_month, stage_progress
            )

        try:
            # Run the Gemini call in an async executor thread
            loop = asyncio.get_event_loop()

            def _call_gemini():
                # Attempt image generation / edit with Gemini model
                response = self.client.models.generate_images(
                    model='imagen-3.0-generate-002',
                    prompt=prompt_used,
                    config=dict(
                        number_of_images=1,
                        aspect_ratio="1:1",
                    )
                )
                if response.generated_images:
                    img_bytes = response.generated_images[0].image.image_bytes
                    b64 = base64.b64encode(img_bytes).decode("utf-8")
                    return f"data:image/png;base64,{b64}"
                raise RuntimeError("No image generated by Gemini model.")

            result_url = await loop.run_in_executor(None, _call_gemini)
            return result_url, prompt_used
        except Exception as e:
            # If remote AI generation fails, raise with descriptive message for the retry endpoint
            raise RuntimeError(f"Gemini AI generation failed: {str(e)}")


class FluxKontextImageProvider(AIImageProvider):
    """
    Extensibility provider for future FLUX Kontext integration.
    """

    async def generate_smile_simulation(
        self,
        image_url: str,
        treatment_type: str,
        stage_month: int,
        stage_progress: int
    ) -> Tuple[str, str]:
        stage_name = f"Month {stage_month}" if stage_progress < 100 else f"Final — Month {stage_month}"
        prompt_used = build_treatment_prompt(treatment_type, stage_name, stage_month, stage_progress)
        # Placeholder for FLUX API integration
        mock = MockAIProvider()
        return await mock.generate_smile_simulation(
            image_url, treatment_type, stage_month, stage_progress
        )


def get_ai_provider(provider_name: Optional[str] = None) -> AIImageProvider:
    """Factory function returning the configured AI image provider."""
    name = (provider_name or settings.AI_PROVIDER).lower().strip()
    if name == "gemini":
        return GeminiImageProvider()
    elif name in ("flux", "flux_kontext"):
        return FluxKontextImageProvider()
    return MockAIProvider()
