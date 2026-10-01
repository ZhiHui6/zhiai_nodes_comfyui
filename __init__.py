from .Nodes.PromptPreset.PromptPresetOneChoice import PromptPresetOneChoice
from .Nodes.PromptPreset.PromptPresetMultipleChoice import PromptPresetMultipleChoice
from .Nodes.ImageEditingPresets.ImageEditingPresets import ImageEditingPresets
from .Nodes.SystemPrompt.SystemPromptLoader import SystemPromptLoader
from .Nodes.SystemPrompt import system_prompt_api
from .Nodes.ExtraOptions import ExtraOptions
from .Nodes.MultiLineTextNode import MultiLineTextNode
from .Nodes.TextCombinerNode import TextCombinerNode
from .Nodes.TextMergerNode import TextMergerNode
from .Nodes.TextModifier import TextModifier
from .Nodes.TextExtractor import TextExtractor
from .Nodes.TriggerWordMerger import TriggerWordMerger
from .Nodes.TextSwitch.TextSwitchDualMode import TextSwitchDualMode
from .Nodes.TextSwitch.PriorityTextSwitch import PriorityTextSwitch
from .Nodes.ShowAny import ShowAny
from .Nodes.MultiPlatformTranslate.MultiPlatformTranslate import MultiPlatformTranslate
from .Nodes.MultiPlatformTranslate.MultiPlatformTranslateAPI import MultiPlatformTranslateAPI
from .Nodes.PhotographPromptGen.PhotographPromptGenerator import PhotographPromptGenerator
from .Nodes.WanPromptGenerator import WanPromptGenerator
from .Nodes.ImageScaler import ImageScaler
from .Nodes.ImgSwitch.ImageSwitchDualMode import ImageSwitchDualMode
from .Nodes.ImgSwitch.PriorityImageSwitch import PriorityImageSwitch
from .Nodes.ColorRemoval import ColorRemoval
from .Nodes.MovieTools.LaplacianSharpen import LaplacianSharpen
from .Nodes.MovieTools.SobelSharpen import SobelSharpen
from .Nodes.MovieTools.USMSharpen import USMSharpen
from .Nodes.MovieTools.ColorMatchToReference import ColorMatchToReference
from .Nodes.MovieTools.FilmGrain import FilmGrain
from .Nodes.LatentSwitchDualMode import LatentSwitchDualMode
from .Nodes.ImageAspectRatio import ImageAspectRatio
from .Nodes.Preview_or_Compare_Images import PreviewOrCompareImages
from .Nodes.PauseWorkflow import PauseWorkflow
from .Nodes.TextEditorWithContinue import TextEditorWithContinue
from .Nodes.TagSelector.TagSelector import TagSelector
from .Nodes.PromptCardSelector.PromptCardSelector import PromptCardSelector
from .Nodes.SunoTools.SunoSongStylePromptGenerator import SunoSongStylePromptGenerator
from .Nodes.SunoTools.SunoLyricsGenerator import SunoLyricsGenerator
from .Nodes.Qwen3VL.Qwen3VLAdvanced import Qwen3VLAdvanced
from .Nodes.Qwen3VL.Qwen3VLBasic import Qwen3VLBasic
from .Nodes.Qwen3VL.Qwen3VLExtraOptions import Qwen3VLExtraOptions
from .Nodes.Qwen3VL.ImageLoader import ImageLoader
from .Nodes.Qwen3VL.VideoLoader import VideoLoader
from .Nodes.Qwen3VL.MultiplePathsInput import MultiplePathsInput
from .Nodes.Qwen3VL.PathSwitch import PathSwitch
from .Nodes.Qwen3VL_API.Qwen3VLAPI import Qwen3VLAPI
from .Nodes.ImageRotateTool import ImageRotateTool
from .Nodes.ImageFormatConverter import ImageFormatConverter
from .Nodes.Sa2VA.Sa2VAAdvanced import Sa2VAAdvanced
from .Nodes.Sa2VA.Sa2VASegmentationPreset import Sa2VASegmentationPreset
from .Nodes.Batch_loading_of_images import BatchLoadingOfImages
from .Nodes.GetImageSizes import GetImageSizes
from .Nodes.PhotographPromptGen.zhihui_api import *
from .Nodes.ResourceCleaner import ResourceCleaner
from .Nodes.ReservedVRAMSetter import ReservedVRAMSetter
from .Nodes.TextEncoderRelease import TextEncoderRelease
from .Nodes.Florence2Plus.florence2plus import Florence2Plus
from .Nodes.PromptGallery.PromptGallery import PromptGallery
from .Nodes.PromptGallery import gallery_api
from .Nodes.TypeDesigner.TypeDesigner import TypeDesigner
from .Nodes.PromptReplace import PromptReplace
from .Nodes.PromptDelete import PromptDelete
from .Nodes.AudioDuration import AudioDuration
from .Nodes.VideoFrameExtractor import VideoFrameExtractor
from .Nodes.IntNode import IntNode
from .Nodes.PromptExpander import PromptExpander
from .Nodes.LMStudio.lmstudio_node import LMStudioNode
from .Nodes.LMStudio import lmstudio_api
from .Nodes.GroupSwitchManager import GroupSwitchManager

import os

NODE_CLASS_MAPPINGS = {
    "PromptPresetOneChoice": PromptPresetOneChoice,
    "PromptPresetMultipleChoice": PromptPresetMultipleChoice,
    "ImageEditingPresets": ImageEditingPresets,
    "SystemPromptLoader": SystemPromptLoader,
    "ExtraOptions": ExtraOptions,
    "MultiLineTextNode": MultiLineTextNode,
    "TextCombinerNode": TextCombinerNode,
    "TextMergerNode": TextMergerNode,
    "TextModifier": TextModifier,
    "TextExtractor": TextExtractor,
    "TriggerWordMerger": TriggerWordMerger,
    "TextSwitchDualMode": TextSwitchDualMode,
    "PriorityTextSwitch": PriorityTextSwitch,
    "ShowAny": ShowAny,
    "MultiPlatformTranslate": MultiPlatformTranslate,
    "PhotographPromptGenerator": PhotographPromptGenerator,
    "WanPromptGenerator": WanPromptGenerator,
    "ImageScaler": ImageScaler,
    "ImageSwitchDualMode": ImageSwitchDualMode,
    "PriorityImageSwitch": PriorityImageSwitch,
    "ColorRemoval": ColorRemoval,
    "LaplacianSharpen": LaplacianSharpen,
    "SobelSharpen": SobelSharpen,
    "USMSharpen": USMSharpen,
    "ColorMatchToReference": ColorMatchToReference,
    "FilmGrain": FilmGrain,
    "LatentSwitchDualMode": LatentSwitchDualMode,
    "PathSwitch": PathSwitch,
    "ImageAspectRatio": ImageAspectRatio,
    "GetImageSizes": GetImageSizes,
    "PreviewOrCompareImages": PreviewOrCompareImages,
    "PauseWorkflow": PauseWorkflow,
    "TextEditorWithContinue": TextEditorWithContinue,
    "TagSelector": TagSelector,
    "PromptCardSelector": PromptCardSelector,
    "SunoSongStylePromptGenerator": SunoSongStylePromptGenerator,
    "SunoLyricsGenerator": SunoLyricsGenerator,
    "Qwen3VLAdvanced": Qwen3VLAdvanced,
    "Qwen3VLBasic": Qwen3VLBasic,
    "Qwen3VLExtraOptions": Qwen3VLExtraOptions,
    "ImageLoader": ImageLoader,
    "VideoLoader": VideoLoader,
    "MultiplePathsInput": MultiplePathsInput,
    "ImageRotateTool": ImageRotateTool,
    "ImageFormatConverter": ImageFormatConverter,
    "Sa2VAAdvanced": Sa2VAAdvanced,
    "Sa2VASegmentationPreset": Sa2VASegmentationPreset,
    "BatchLoadingOfImages": BatchLoadingOfImages,
    "Qwen3VLAPI": Qwen3VLAPI,
    "ResourceCleaner": ResourceCleaner,
    "ReservedVRAMSetter": ReservedVRAMSetter,
    "TextEncoderRelease": TextEncoderRelease,
    "Florence2Plus": Florence2Plus,
    "PromptGallery": PromptGallery,
    "TypeDesigner": TypeDesigner,
    "PromptReplace": PromptReplace,
    "PromptDelete": PromptDelete,
    "AudioDuration": AudioDuration,
    "VideoFrameExtractor": VideoFrameExtractor,
    "IntNode": IntNode,
    "PromptExpander": PromptExpander,
    "LMStudioNode": LMStudioNode,
    "GroupSwitchManager": GroupSwitchManager,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "PromptPresetOneChoice": "Prompt Preset One Choice",
    "PromptPresetMultipleChoice": "Prompt Preset Multiple Choice",
    "ImageEditingPresets": "Image Editing Presets",
    "SystemPromptLoader": "System Prompt Loader",
    "ExtraOptions": "Extra Options",
    "MultiLineTextNode": "Multi Line Text Node",
    "TextCombinerNode": "Text Combiner Node",
    "TextMergerNode": "Text Merger Node",
    "TextModifier": "Text Modifier",
    "TextExtractor": "Text Extractor",
    "TriggerWordMerger": "Trigger Word Merger",
    "TextSwitchDualMode": "Text Switch Dual Mode",
    "PriorityTextSwitch": "Priority Text Switch",
    "ShowAny": "Show Any",
    "MultiPlatformTranslate": "Multi Platform Translate",
    "PhotographPromptGenerator": "Photograph Prompt Generator",
    "WanPromptGenerator": "Wan Prompt Generator",
    "ImageScaler": "Image Scaler",
    "ImageSwitchDualMode": "Image Switch Dual Mode",
    "PriorityImageSwitch": "Priority Image Switch",
    "ColorRemoval": "Color Removal",
    "LaplacianSharpen": "Laplacian Sharpen",
    "SobelSharpen": "Sobel Sharpen",
    "USMSharpen": "USM Sharpen",
    "ColorMatchToReference": "Color Match To Reference",
    "FilmGrain": "Film Grain",
    "LatentSwitchDualMode": "Latent Switch Dual Mode",
    "ImageAspectRatio": "Image Aspect Ratio",
    "GetImageSizes": "Get Image Sizes",
    "PreviewOrCompareImages": "Preview or Compare Images",
    "PauseWorkflow": "Pause Workflow",
    "TextEditorWithContinue": "Text Editor with Continue",
    "TagSelector": "Tag Selector",
    "PromptCardSelector": "Prompt Card Selector",
    "SunoSongStylePromptGenerator": "Suno Song Style Prompt Generator",
    "SunoLyricsGenerator": "Suno AI Lyrics Generator",
    "Qwen3VLAdvanced": "Qwen3-VL Advanced",
    "Qwen3VLBasic": "Qwen3-VL Basic",
    "Qwen3VLExtraOptions": "Qwen3-VL Extra Options",
    "ImageLoader": "Qwen3-VL Image Loader",
    "VideoLoader": "Qwen3-VL Video Loader",
    "MultiplePathsInput": "Qwen3-VL Multiple Paths Input",
    "PathSwitch": "Qwen3-VL Path Switch",
    "ImageRotateTool": "Image Rotate Tool",
    "ImageFormatConverter": "Image Format Converter",
    "Sa2VAAdvanced": "Sa2VA Advanced",
    "Sa2VASegmentationPreset": "Sa2VA Segmentation Preset",
    "BatchLoadingOfImages": "Batch Loading Of Images",
    "Qwen3VLAPI": "Qwen3-VL API",
    "ResourceCleaner": "Resource Cleaner",
    "ReservedVRAMSetter": "Reserved VRAM Setter",
    "TextEncoderRelease": "Text Encoder Release",
    "Florence2Plus": "Florence2 Plus",
    "PromptGallery": "Prompt Gallery",
    "TypeDesigner": "Type Designer",
    "PromptReplace": "Prompt Replace",
    "PromptDelete": "Prompt Delete",
    "AudioDuration": "Audio Duration",
    "VideoFrameExtractor": "Video Frame Extractor",
    "IntNode": "Int",
    "PromptExpander": "Prompt Expander",
    "LMStudioNode": "LM Studio Node",
    "GroupSwitchManager": "Group Switch Manager",
}

from . import locale_api

WEB_DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web")
__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS', "WEB_DIRECTORY"]