def build_treatment_prompt(
    treatment_type: str,
    stage_name: str,
    stage_month: int,
    stage_progress: int
) -> str:
    """
    Builds treatment-specific AI generation prompt instructions
    adhering strictly to clinical and medical communication specifications.
    """
    norm_type = treatment_type.lower().strip()
    if norm_type == "dental_veneers":
        norm_type = "veneers"

    common_guidelines = (
        "TASK: Generate a photorealistic dental smile treatment visualization based on the provided patient photograph.\n\n"
        "STRICT PRESERVATION DIRECTIVES:\n"
        "1. Preserve the patient's facial identity, face shape, lips, skin tone, eye position, hair, lighting, camera angle, and background exactly.\n"
        "2. Modify strictly and exclusively the visible teeth and smile region.\n"
        "3. Do not modify or alter any unrelated facial features.\n"
        "4. This is an AI-generated potential treatment visualization for educational and communication purposes, NOT a guaranteed clinical outcome.\n\n"
    )

    stage_context = f"CURRENT STAGE: {stage_name} | Month: {stage_month} | Progress: {stage_progress}%\n\n"

    if norm_type == "clear_aligners":
        if stage_progress == 0:
            details = (
                "STAGE SPECIFICS: Baseline / Initial Stage (0% progress).\n"
                "- Display initial tooth alignment and baseline dental status.\n"
                "- No corrective movement applied."
            )
        elif stage_progress < 30:
            details = (
                f"STAGE SPECIFICS: Early Stage ({stage_progress}% progress).\n"
                "- Create a realistic visual simulation showing subtle potential improvement in tooth alignment corresponding to an early stage of clear aligner treatment.\n"
                "- Minor initial de-crowding and early alignment engagement of anterior teeth.\n"
                "- Maintain natural tooth enamel texture and lifelike reflections."
            )
        elif stage_progress < 85:
            details = (
                f"STAGE SPECIFICS: Intermediate Stage ({stage_progress}% progress).\n"
                "- Show moderate, progressive tooth repositioning and noticeable reduction in anterior crowding or spacing.\n"
                "- Harmonious arch leveling and progressive arch widening.\n"
                "- Natural incisal edge alignment progressing steadily."
            )
        else:
            details = (
                f"STAGE SPECIFICS: Final Target Stage ({stage_progress}% progress).\n"
                "- Create a potential final visual appearance showing the intended optimal improvement in tooth alignment.\n"
                "- Complete de-crowding, optimal arch symmetry, and harmonious incisal smile curve.\n"
                "- Natural healthy enamel appearance with complete identity preservation."
            )
        treatment_focus = (
            "CLINICAL FOCUS: Clear Aligners\n"
            "- Focus areas: progressive alignment, crowding reduction, spacing closure, arch continuity."
        )

    elif norm_type == "veneers":
        if stage_progress == 0:
            details = (
                "STAGE SPECIFICS: Baseline / Initial Assessment.\n"
                "- Initial tooth shade, incisal wear, or irregularities."
            )
        elif stage_progress < 50:
            details = (
                f"STAGE SPECIFICS: Preparation & Diagnostic Stage ({stage_progress}% progress).\n"
                "- Initial aesthetic improvement in tooth contours and provisional shade balance.\n"
                "- Subtle refinement of incisal edge symmetry."
            )
        elif stage_progress < 90:
            details = (
                f"STAGE SPECIFICS: Advanced Aesthetic Refinement ({stage_progress}% progress).\n"
                "- High-fidelity porcelain veneer trial appearance.\n"
                "- Improved tooth proportions, balanced gingival margins, and natural brightness enhancement."
            )
        else:
            details = (
                f"STAGE SPECIFICS: Final Veneer Placement ({stage_progress}% progress).\n"
                "- Optimal cosmetic smile rehabilitation.\n"
                "- Perfect golden proportion symmetry across maxillary anterior teeth (#6 through #11).\n"
                "- Natural Vita Bleach / B1 shade with realistic incisal translucency and micro-texture."
            )
        treatment_focus = (
            "CLINICAL FOCUS: Dental Veneers\n"
            "- Focus areas: tooth shape harmony, bilateral symmetry, natural color/brightness enhancement, incisal translucency."
        )

    elif norm_type == "braces":
        if stage_progress == 0:
            details = (
                "STAGE SPECIFICS: Initial Bonding Stage (0% progress).\n"
                "- Baseline malocclusion."
            )
        elif stage_progress < 50:
            details = (
                f"STAGE SPECIFICS: Early to Mid Alignment ({stage_progress}% progress).\n"
                "- Subtle alignment improvement along orthodontic archwire.\n"
                "- Early de-crowding and leveling of irregular incisors.\n"
                "- Aesthetic ceramic or metallic low-profile brackets on dental arch."
            )
        elif stage_progress < 90:
            details = (
                f"STAGE SPECIFICS: Advanced Alignment & Detailing ({stage_progress}% progress).\n"
                "- Significant leveling, rotational correction, and space management.\n"
                "- Clean arch form nearing target occlusion."
            )
        else:
            details = (
                f"STAGE SPECIFICS: Final Debonding & Polished Smile ({stage_progress}% progress).\n"
                "- Final debonded result without brackets or hardware.\n"
                "- Beautifully aligned, level dental arch with balanced smile line.\n"
                "- Natural healthy enamel polish and preservation of patient's unique facial expression."
            )
        treatment_focus = (
            "CLINICAL FOCUS: Comprehensive Fixed Braces\n"
            "- Focus areas: progressive alignment, crowding reduction, arch leveling, bracket detailing."
        )

    else:
        treatment_focus = f"CLINICAL FOCUS: {treatment_type.capitalize()}\n"
        details = f"STAGE SPECIFICS: Progression at {stage_progress}% of treatment plan."

    disclaimer_note = (
        "\n\nIMPORTANT CLINICAL DISCLAIMER:\n"
        "Do not claim that the generated image represents an exact clinical outcome. "
        "This output represents a potential aesthetic visualization for clinical dialogue."
    )

    return f"{common_guidelines}{stage_context}{treatment_focus}\n\n{details}{disclaimer_note}"
