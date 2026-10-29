from .Nodes.PromptPreset.PromptPresetOneChoice import PromptPresetOneChoice
from .Nodes.PromptPreset.PromptPresetMultipleChoice import PromptPresetMultipleChoice
from .Nodes.ImageEditingPresets.ImageEditingPresets import ImageEditingPresets
from .Nodes.SystemPrompt.SystemPromptLoader import SystemPromptLoader
from .Nodes.SystemPrompt import system_prompt_api
from .Nodes.MultiLineTextNode import MultiLineTextNode
from .Nodes.PromptCombiner import PromptCombiner
from .Nodes.TextMergerNode import TextMergerNode
from .Nodes.TextModifier import TextModifier
from .Nodes.TextExtractor import TextExtractor
from .Nodes.TextSwitch.TextSwitchDualMode import TextSwitchDualMode
from .Nodes.TextSwitch.PriorityTextSwitch import PriorityTextSwitch
from .Nodes.ShowAny import ShowAny
from .Nodes.MultiPlatformTranslate.MultiPlatformTranslate import MultiPlatformTranslate
from .Nodes.MultiPlatformTranslate.MultiPlatformTranslateAPI import MultiPlatformTranslateAPI
from .Nodes.PhotographPromptGen.PhotographPromptGenerator import PhotographPromptGenerator
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
from .Nodes.TextEditorWithContinue import TextEditorWithContinue
from .Nodes.TagSelector.TagSelector import TagSelector
from .Nodes.PromptCardSelector.PromptCardSelector import PromptCardSelector
from .Nodes.SunoTools.SunoSongStylePromptGenerator import SunoSongStylePromptGenerator
from .Nodes.SunoTools.SunoLyricsGenerator import SunoLyricsGenerator
from .Nodes.llm_extra_options import LLMExtraOptions
from .Nodes.ImageUnderstandingOnline.image_understanding_online import ImageUnderstandingOnline
from .Nodes.ImageRotateTool import ImageRotateTool
from .Nodes.ImageFormatConverter import ImageFormatConverter
from .Nodes.Batch_loading_of_images import BatchLoadingOfImages
from .Nodes.GetImageSizes import GetImageSizes
from .Nodes.PhotographPromptGen.zhiai_api import *
from .Nodes.ResourceCleaner import ResourceCleaner
from .Nodes.ReservedVRAMSetter import ReservedVRAMSetter
from .Nodes.TextEncoderRelease import TextEncoderRelease
from .Nodes.PromptGallery.PromptGallery import PromptGallery
from .Nodes.PromptGallery import gallery_api
from .Nodes.TypeDesigner.TypeDesigner import TypeDesigner
from .Nodes.PromptReplace import PromptReplace
from .Nodes.PromptDelete import PromptDelete
from .Nodes.AudioDuration import AudioDuration
from .Nodes.VideoFrameExtractor import VideoFrameExtractor
from .Nodes.IntNode import IntNode
from .Nodes.LMStudio.lmstudio_node import LMStudioNode
from .Nodes.LMStudio import lmstudio_api
from .Nodes.GroupSwitchManager import GroupSwitchManager
from .Nodes.MultimediaAdvancedLoader import MultimediaAdvancedLoader
from .Nodes.LoraStackLoader import LoraStackLoader
from .Nodes.VideoPreview import VideoPreview
from .Nodes.ImageIndexer import ImageIndexer

import os

NODE_CLASS_MAPPINGS = {
    "PromptPresetOneChoice": PromptPresetOneChoice,
    "PromptPresetMultipleChoice": PromptPresetMultipleChoice,
    "ImageEditingPresets": ImageEditingPresets,
    "SystemPromptLoader": SystemPromptLoader,
    "MultiLineTextNode": MultiLineTextNode,
    "PromptCombiner": PromptCombiner,
    "TextMergerNode": TextMergerNode,
    "TextModifier": TextModifier,
    "TextExtractor": TextExtractor,
    "TextSwitchDualMode": TextSwitchDualMode,
    "PriorityTextSwitch": PriorityTextSwitch,
    "ShowAny": ShowAny,
    "MultiPlatformTranslate": MultiPlatformTranslate,
    "PhotographPromptGenerator": PhotographPromptGenerator,
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
    "ImageAspectRatio": ImageAspectRatio,
    "GetImageSizes": GetImageSizes,
    "PreviewOrCompareImages": PreviewOrCompareImages,
    "TextEditorWithContinue": TextEditorWithContinue,
    "TagSelector": TagSelector,
    "PromptCardSelector": PromptCardSelector,
    "SunoSongStylePromptGenerator": SunoSongStylePromptGenerator,
    "SunoLyricsGenerator": SunoLyricsGenerator,
    "LLMExtraOptions": LLMExtraOptions,
    "ImageRotateTool": ImageRotateTool,
    "ImageFormatConverter": ImageFormatConverter,
    "BatchLoadingOfImages": BatchLoadingOfImages,
    "ImageUnderstandingOnline": ImageUnderstandingOnline,
    "ResourceCleaner": ResourceCleaner,
    "ReservedVRAMSetter": ReservedVRAMSetter,
    "TextEncoderRelease": TextEncoderRelease,
    "PromptGallery": PromptGallery,
    "TypeDesigner": TypeDesigner,
    "PromptReplace": PromptReplace,
    "PromptDelete": PromptDelete,
    "AudioDuration": AudioDuration,
    "VideoFrameExtractor": VideoFrameExtractor,
    "IntNode": IntNode,
    "LMStudioNode": LMStudioNode,
    "GroupSwitchManager": GroupSwitchManager,
    "MultimediaAdvancedLoader": MultimediaAdvancedLoader,
    "LoraStackLoader": LoraStackLoader,
    "VideoPreview": VideoPreview,
    "ImageIndexer": ImageIndexer,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "PromptPresetOneChoice": "Prompt Preset One Choice",
    "PromptPresetMultipleChoice": "Prompt Preset Multiple Choice",
    "ImageEditingPresets": "Image Editing Presets",
    "SystemPromptLoader": "System Prompt Loader",
    "MultiLineTextNode": "Multi Line Text Node",
    "PromptCombiner": "Prompt Combiner",
    "TextMergerNode": "Text Merger Node",
    "TextModifier": "Text Modifier",
    "TextExtractor": "Text Extractor",
    "TextSwitchDualMode": "Text Switch Dual Mode",
    "PriorityTextSwitch": "Priority Text Switch",
    "ShowAny": "Show Any",
    "MultiPlatformTranslate": "Multi Platform Translate",
    "PhotographPromptGenerator": "Photograph Prompt Generator",
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
    "TextEditorWithContinue": "Text Editor with Continue",
    "TagSelector": "Tag Selector",
    "PromptCardSelector": "Prompt Card Selector",
    "SunoSongStylePromptGenerator": "Suno Song Style Prompt Generator",
    "SunoLyricsGenerator": "Suno AI Lyrics Generator",
    "LLMExtraOptions": "LLM Extra Options",
    "ImageRotateTool": "Image Rotate Tool",
    "ImageFormatConverter": "Image Format Converter",
    "BatchLoadingOfImages": "Batch Loading Of Images",
    "ImageUnderstandingOnline": "Image Understanding Online",
    "ResourceCleaner": "Resource Cleaner",
    "ReservedVRAMSetter": "Reserved VRAM Setter",
    "TextEncoderRelease": "Text Encoder Release",
    "PromptGallery": "Prompt Gallery",
    "TypeDesigner": "Type Designer",
    "PromptReplace": "Prompt Replace",
    "PromptDelete": "Prompt Delete",
    "AudioDuration": "Audio Duration",
    "VideoFrameExtractor": "Video Frame Extractor",
    "IntNode": "Int",
    "LMStudioNode": "LM Studio Node",
    "GroupSwitchManager": "Group Switch Manager",
    "MultimediaAdvancedLoader": "Multimedia Loader",
    "LoraStackLoader": "LoRA Stack Loader",
    "VideoPreview": "Video Preview",
    "ImageIndexer": "Image Indexer",
}

from . import locale_api
from . import preset_api
from . import lora_preview_api
from .Nodes.ZhiAIApiConfig import ZhiAIApiConfig  # noqa: F401

WEB_DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web")
__all__ = ['NODE_CLASS_MAPPINGS', 'NODE_DISPLAY_NAME_MAPPINGS', "WEB_DIRECTORY"]