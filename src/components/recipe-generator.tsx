
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import type { GenerateRecipeOutput } from "@/ai/flows/generate-recipe-flow";
import { handleGenerateRecipe, handleAnalyzeIngredients, handleAnalyzeImage } from "@/app/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RecipeDisplay } from "./recipe-display";
import { Sparkles, Search, Utensils, ThumbsUp, Lightbulb, TriangleAlert, X, Mic, Camera, VideoOff, Upload, Loader2, Trash2, ArrowRight, ShoppingCart } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { useRecipeStore } from "@/store/recipe-store";
import type { AnalyzeIngredientsOutput } from "@/ai/flows/analyze-ingredients-flow";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


const ingredientsData = [
  {"id":"ing001","name":"chicken","category":"meat","tags":["animal-product","protein"]},
  {"id":"ing005","name":"turkey","category":"meat","tags":["animal-product"]},
  {"id":"ing006","name":"duck","category":"meat","tags":["animal-product"]},
  {"id":"ing011","name":"bacon","category":"meat","tags":["pork","processed"]},
  {"id":"ing013","name":"salmon","category":"seafood","tags":["fish"]},
  {"id":"ing014","name":"tuna","category":"seafood","tags":["fish"]},
  {"id":"ing015","name":"cod","category":"seafood","tags":["fish"]},
  {"id":"ing017","name":"trout","category":"seafood","tags":["fish"]},
  {"id":"ing019","name":"shrimp","category":"seafood","tags":["shellfish","allergen:shellfish"]},
  {"id":"ing021","name":"lobster","category":"seafood","tags":["shellfish","allergen:shellfish"]},
  {"id":"ing022","name":"crab","category":"seafood","tags":["shellfish","allergen:shellfish"]},
  {"id":"ing023","name":"scallops","category":"seafood","tags":["shellfish","allergen:shellfish"]},
  {"id":"ing024","name":"mussels","category":"seafood","tags":["shellfish","allergen:shellfish"]},
  {"id":"ing025","name":"clams","category":"seafood","tags":["shellfish","allergen:shellfish"]},
  {"id":"ing026","name":"oysters","category":"seafood","tags":["shellfish","allergen:shellfish"]},
  {"id":"ing029","name":"anchovy","category":"seafood","tags":["fish","umami"]},
  {"id":"ing031","name":"milk","category":"dairy","tags":["dairy","allergen:dairy"]},
  {"id":"ing033","name":"butter","category":"dairy","tags":["dairy","fat"]},
  {"id":"ing035","name":"heavy cream","category":"dairy","tags":["dairy"]},
  {"id":"ing036","name":"yogurt","category":"dairy","tags":["dairy","fermented"]},
  {"id":"ing037","name":"greek yogurt","category":"dairy","tags":["dairy","fermented"]},
  {"id":"ing038","name":"sour cream","category":"dairy","tags":["dairy"]},
  {"id":"ing039","name":"cream cheese","category":"dairy","tags":["dairy"]},
  {"id":"ing040","name":"cheddar","category":"cheese","tags":["dairy"]},
  {"id":"ing041","name":"mozzarella","category":"cheese","tags":["dairy"]},
  {"id":"ing042","name":"parmesan","category":"cheese","tags":["dairy"]},
  {"id":"ing043","name":"feta","category":"cheese","tags":["dairy"]},
  {"id":"ing045","name":"goat cheese","category":"cheese","tags":["dairy"]},
  {"id":"ing046","name":"eggs","category":"protein","tags":["animal-product","allergen:eggs"]},
  {"id":"ing047","name":"almond milk","category":"plant-milk","tags":["plant","allergen:tree-nut"]},
  {"id":"ing048","name":"oat milk","category":"plant-milk","tags":["plant"]},
  {"id":"ing049","name":"soy milk","category":"plant-milk","tags":["plant","allergen:soy"]},
  {"id":"ing050","name":"coconut milk","category":"plant-milk","tags":["plant","allergen:coconut"]},
  {"id":"ing053","name":"rice","category":"grain","tags":["gluten-free","starch"]},
  {"id":"ing055","name":"basmati rice","category":"grain","tags":["gluten-free"]},
  {"id":"ing057","name":"quinoa","category":"grain","tags":["gluten-free","protein"]},
  {"id":"ing061","name":"oats","category":"grain","tags":["may-contain-gluten"]},
  {"id":"ing064","name":"pasta","category":"grain","tags":["gluten"]},
  {"id":"ing065","name":"wheat flour","category":"baking","tags":["gluten"]},
  {"id":"ing066","name":"bread","category":"grain","tags":["gluten"]},
  {"id":"ing067","name":"chickpeas","category":"legume","tags":["plant","protein"]},
  {"id":"ing068","name":"lentils","category":"legume","tags":["plant","protein"]},
  {"id":"ing070","name":"black beans","category":"legume","tags":["plant"]},
  {"id":"ing071","name":"kidney beans","category":"legume","tags":["plant"]},
  {"id":"ing075","name":"edamame","category":"legume","tags":["allergen:soy"]},
  {"id":"ing076","name":"mung beans","category":"legume","tags":["plant"]},
  {"id":"ing077","name":"almonds","category":"nut","tags":["allergen:tree-nut"]},
  {"id":"ing078","name":"cashews","category":"nut","tags":["allergen:tree-nut"]},
  {"id":"ing079","name":"peanuts","category":"nut","tags":["allergen:peanut"]},
  {"id":"ing080","name":"walnuts","category":"nut","tags":["allergen:tree-nut"]},
  {"id":"ing083","name":"pistachios","category":"nut","tags":["allergen:tree-nut"]},
  {"id":"ing086","name":"sunflower seeds","category":"seed","tags":["plant"]},
  {"id":"ing087","name":"pumpkin seeds","category":"seed","tags":["plant"]},
  {"id":"ing088","name":"chia seeds","category":"seed","tags":["plant"]},
  {"id":"ing089","name":"flaxseed","category":"seed","tags":["plant"]},
  {"id":"ing090","name":"sesame seeds","category":"seed","tags":["allergen:sesame"]},
  {"id":"ing091","name":"tomato","category":"vegetable","tags":["plant"]},
  {"id":"ing092","name":"onion","category":"vegetable","tags":["aromatic"]},
  {"id":"ing093","name":"garlic","category":"vegetable","tags":["aromatic"]},
  {"id":"ing097","name":"potato","category":"vegetable","tags":["starch"]},
  {"id":"ing099","name":"carrot","category":"vegetable","tags":["plant"]},
  {"id":"ing100","name":"red bell pepper","category":"vegetable","tags":["plant"]},
  {"id":"ing104","name":"jalapeño","category":"vegetable","tags":["spicy"]},
  {"id":"ing107","name":"eggplant","category":"vegetable","tags":["plant"]},
  {"id":"ing108","name":"button mushroom","category":"fungi","tags":["plant-like"]},
  {"id":"ing111","name":"spinach","category":"vegetable","tags":["leafy"]},
  {"id":"ing116","name":"broccoli","category":"vegetable","tags":["cruciferous"]},
  {"id":"ing117","name":"cauliflower","category":"vegetable","tags":["cruciferous"]},
  {"id":"ing120","name":"apple","category":"fruit","tags":["plant"]},
  {"id":"ing121","name":"banana","category":"fruit","tags":["plant"]},
  {"id":"ing122","name":"orange","category":"fruit","tags":["citrus"]},
  {"id":"ing123","name":"lemon","category":"fruit","tags":["citrus"]},
  {"id":"ing124","name":"lime","category":"fruit","tags":["citrus"]},
  {"id":"ing126","name":"mango","category":"fruit","tags":["tropical"]},
  {"id":"ing131","name":"strawberry","category":"fruit","tags":["berry"]},
  {"id":"ing132","name":"blueberry","category":"fruit","tags":["berry"]},
  {"id":"ing136","name":"pomegranate","category":"fruit","tags":["plant"]},
  {"id":"ing138","name":"coconut","category":"fruit","tags":["tropical","allergen:coconut"]},
  {"id":"ing139","name":"olive oil","category":"oil","tags":["fat","plant"]},
  {"id":"ing140","name":"vegetable oil","category":"oil","tags":["fat"]},
  {"id":"ing141","name":"canola oil","category":"oil","tags":["fat"]},
  {"id":"ing142","name":"sesame oil","category":"oil","tags":["allergen:sesame"]},
  {"id":"ing144","name":"coconut oil","category":"oil","tags":["plant"]},
  {"id":"ing145","name":"sugar","category":"sweetener","tags":["sweet"]},
  {"id":"ing147","name":"honey","category":"sweetener","tags":["animal-product"]},
  {"id":"ing148","name":"maple syrup","category":"sweetener","tags":["plant"]},
  {"id":"ing149","name":"soy sauce","category":"condiment","tags":["contains:soy","contains:wheat"]},
  {"id":"ing150","name":"fish sauce","category":"condiment","tags":["contains:fish"]},
  {"id":"ing151","name":"vinegar","category":"condiment","tags":["acid"]},
  {"id":"ing157","name":"tomato paste","category":"condiment","tags":["tomato"]},
  {"id":"ing159","name":"miso","category":"condiment","tags":["fermented","contains:soy"]},
  {"id":"ing160","name":"tahini","category":"condiment","tags":["allergen:sesame"]},
  {"id":"ing161","name":"tofu","category":"protein","tags":["plant","allergen:soy"]},
  {"id":"ing162","name":"paneer","category":"dairy","tags":["dairy"]},
  {"id":"ing170","name":"chocolate","category":"baking","tags":["contains:cacao"]},
  {"id":"ing172","name":"coffee","category":"beverage","tags":["bitter"]},
  {"id":"ing173","name":"tea","category":"beverage","tags":["bitter"]},
  {"id":"ing181","name":"black gram","category":"legume","tags":["plant"]},
  {"id":"ing182","name":"turmeric","category":"spice","tags":["plant"]},
  {"id":"ing183","name":"cumin","category":"spice","tags":["plant"]},
  {"id":"ing184","name":"coriander","category":"spice","tags":["plant"]},
  {"id":"ing185","name":"cardamom (green)","category":"spice","tags":["plant"]},
  {"id":"ing186","name":"cardamom (black)","category":"spice","tags":["plant"]},
  {"id":"ing187","name":"cinnamon","category":"spice","tags":["plant"]},
  {"id":"ing188","name":"clove","category":"spice","tags":["plant"]},
  {"id":"ing189","name":"mustard seeds","category":"spice","tags":["plant"]},
  {"id":"ing190","name":"fenugreek seeds","category":"spice","tags":["plant"]},
  {"id":"ing191","name":"asafoetida (hing)","category":"spice","tags":["plant"]},
  {"id":"ing192","name":"curry leaves","category":"spice","tags":["plant"]},
  {"id":"ing193","name":"bay leaf","category":"spice","tags":["plant"]},
  {"id":"ing194","name":"nutmeg","category":"spice","tags":["plant"]},
  {"id":"ing195","name":"mace","category":"spice","tags":["plant"]},
  {"id":"ing196","name":"fennel seeds","category":"spice","tags":["plant"]},
  {"id":"ing197","name":"black pepper","category":"spice","tags":["plant"]},
  {"id":"ing198","name":"red chili powder","category":"spice","tags":["spicy"]},
  {"id":"ing199","name":"garam masala","category":"spice","tags":["blend"]},
  {"id":"ing200","name":"ginger","category":"vegetable","tags":["aromatic"]},
  {"id":"ing201","name":"green peas","category":"vegetable","tags":["plant"]},
  {"id":"ing202","name":"okra","category":"vegetable","tags":["plant"]},
  {"id":"ing203","name":"tamarind","category":"fruit","tags":["sour"]},
  {"id":"ing204","name":"mint","category":"herb","tags":["plant"]},
  {"id":"ing205","name":"cilantro (coriander leaves)","category":"herb","tags":["plant"]},
  {"id":"ing206","name":"methi (fenugreek leaves)","category":"herb","tags":["plant"]},
  {"id":"ing207","name":"raisins","category":"fruit","tags":["dried"]},
  {"id":"ing208","name":"dates","category":"fruit","tags":["dried"]},
  {"id":"ing209","name":"fig","category":"fruit","tags":["dried"]},
  {"id":"ing210","name":"coconut flakes","category":"fruit","tags":["dried","allergen:coconut"]},
  {"id":"ing211","name":"mustard oil","category":"oil","tags":["fat","plant"]},
  {"id":"ing212","name":"ghee","category":"dairy","tags":["dairy","fat"]},
  {"id":"ing213","name":"jaggery","category":"sweetener","tags":["sweet"]},
  {"id":"ing214","name":"poppy seeds","category":"seed","tags":["plant"]},
  {"id":"ing215","name":"black salt (kala namak)","category":"salt","tags":["mineral"]},
  {"id":"ing216","name":"rock salt (sendha namak)","category":"salt","tags":["mineral"]},
  {"id":"ing217","name":"red chili","category":"vegetable","tags":["spicy"]},
  {"id":"ing218","name":"green chili","category":"vegetable","tags":["spicy"]},
  {"id":"ing219","name":"ginger powder","category":"spice","tags":["dried"]},
  {"id":"ing220","name":"turmeric powder","category":"spice","tags":["dried"]},
  {"id":"ing221","name":"coriander powder","category":"spice","tags":["dried"]},
  {"id":"ing222","name":"cumin powder","category":"spice","tags":["dried"]},
  {"id":"ing223","name":"asafoetida powder","category":"spice","tags":["dried"]},
  {"id":"ing224","name":"garlic paste","category":"condiment","tags":["aromatic"]},
  {"id":"ing225","name":"ginger paste","category":"condiment","tags":["aromatic"]},
  {"id":"ing226","name":"tamarind paste","category":"condiment","tags":["sour"]},
  {"id":"ing227","name":"coconut paste","category":"condiment","tags":["allergen:coconut"]},
  {"id":"ing228","name":"green chutney (mint)","category":"condiment","tags":["fresh"]},
  {"id":"ing229","name":"tamarind chutney","category":"condiment","tags":["sweet","sour"]},
  {"id":"ing230","name":"coriander chutney","category":"condiment","tags":["fresh"]},
  {"id":"ing231","name":"onion chutney","category":"condiment","tags":["aromatic"]},
  {"id":"ing232","name":"biryani masala","category":"spice","tags":["blend"]},
  {"id":"ing233","name":"sambar powder","category":"spice","tags":["blend"]},
  {"id":"ing234","name":"rasam powder","category":"spice","tags":["blend"]},
  {"id":"ing235","name":"panch phoron","category":"spice","tags":["blend"]},
  {"id":"ing236","name":"kachori masala","category":"spice","tags":["blend"]},
  {"id":"ing237","name":"tandoori masala","category":"spice","tags":["blend"]},
  {"id":"ing238","name":"chole masala","category":"spice","tags":["blend"]},
  {"id":"ing239","name":"madras curry powder","category":"spice","tags":["blend"]},
  {"id":"ing240","name":"pickle (achar)","category":"condiment","tags":["preserved"]},
  {"id":"ing241","name":"raita","category":"condiment","tags":["dairy"]},
  {"id":"ing242","name":"curd","category":"dairy","tags":["dairy"]},
  {"id":"ing243","name":"lassi","category":"dairy","tags":["dairy","beverage"]},
  {"id":"ing244","name":"ajwain (carom seeds)","category":"spice","tags":["plant"]},
  {"id":"ing245","name":"kalonji (nigella seeds)","category":"spice","tags":["plant"]},
  {"id":"ing246","name":"shahi jeera (black cumin)","category":"spice","tags":["plant"]},
  {"id":"ing247","name":"star anise","category":"spice","tags":["plant"]},
  {"id":"ing248","name":"coriander seeds","category":"spice","tags":["plant"]},
  {"id":"ing249","name":"fennel","category":"vegetable","tags":["plant"]},
  {"id":"ing250","name":"papaya","category":"fruit","tags":["plant"]},
  {"id":"ing251","name":"jackfruit","category":"fruit","tags":["plant"]},
  {"id":"ing252","name":"drumstick (moringa)","category":"vegetable","tags":["plant"]},
  {"id":"ing253","name":"bitter gourd","category":"vegetable","tags":["plant"]},
  {"id":"ing254","name":"moringa leaves","category":"vegetable","tags":["leafy"]},
  {"id":"ing255","name":"capsicum (bell pepper)","category":"vegetable","tags":["plant"]},
  {"id":"ing256","name":"artichoke","category":"vegetable","tags":[]},
  {"id":"ing257","name":"arugula","category":"vegetable","tags":["leafy"]},
  {"id":"ing258","name":"asparagus","category":"vegetable","tags":["spring"]},
  {"id":"ing259","name":"avocado","category":"fruit","tags":["fat","plant"]},
  {"id":"ing260","name":"bamboo shoots","category":"vegetable","tags":[]},
  {"id":"ing261","name":"bell pepper (green)","category":"vegetable","tags":[]},
  {"id":"ing262","name":"bell pepper (yellow)","category":"vegetable","tags":[]},
  {"id":"ing263","name":"bok choy","category":"vegetable","tags":["leafy","cruciferous"]},
  {"id":"ing264","name":"brussels sprouts","category":"vegetable","tags":["cruciferous"]},
  {"id":"ing265","name":"cabbage","category":"vegetable","tags":["cruciferous"]},
  {"id":"ing266","name":"celery","category":"vegetable","tags":["aromatic"]},
  {"id":"ing267","name":"collard greens","category":"vegetable","tags":["leafy"]},
  {"id":"ing268","name":"corn","category":"vegetable","tags":["starch"]},
  {"id":"ing269","name":"cucumber","category":"vegetable","tags":[]},
  {"id":"ing270","name":"endive","category":"vegetable","tags":["leafy"]},
  {"id":"ing271","name":"green beans","category":"legume","tags":["plant"]},
  {"id":"ing272","name":"jicama","category":"vegetable","tags":["root"]},
  {"id":"ing273","name":"kale","category":"vegetable","tags":["leafy"]},
  {"id":"ing274","name":"kohlrabi","category":"vegetable","tags":["cruciferous"]},
  {"id":"ing275","name":"leek","category":"vegetable","tags":["aromatic"]},
  {"id":"ing276","name":"lettuce","category":"vegetable","tags":["leafy"]},
  {"id":"ing277","name":"parsnip","category":"vegetable","tags":["root"]},
  {"id":"ing278","name":"radish","category":"vegetable","tags":["root"]},
  {"id":"ing279","name":"rutabaga","category":"vegetable","tags":["root"]},
  {"id":"ing280","name":"seaweed","category":"vegetable","tags":["sea-vegetable"]},
  {"id":"ing281","name":"shallot","category":"vegetable","tags":["aromatic"]},
  {"id":"ing282","name":"snow peas","category":"legume","tags":["plant"]},
  {"id":"ing283","name":"spaghetti squash","category":"vegetable","tags":["squash"]},
  {"id":"ing284","name":"sweet potato","category":"vegetable","tags":["starch","root"]},
  {"id":"ing285","name":"swiss chard","category":"vegetable","tags":["leafy"]},
  {"id":"ing286","name":"turnip","category":"vegetable","tags":["root"]},
  {"id":"ing287","name":"watercress","category":"vegetable","tags":["leafy"]},
  {"id":"ing288","name":"zucchini","category":"vegetable","tags":["squash"]}
].sort((a, b) => a.name.localeCompare(b.name));

const ingredientCatalog = ingredientsData.map(i => i.name);

const groceryStores = [
    { name: "Zepto", url: "https://www.zeptonow.com/search?query=", color: "bg-green-500" },
    { name: "Swiggy Instamart", url: "https://www.swiggy.com/instamart/search?custom_back=true&query=", color: "bg-orange-500" },
    { name: "BigBasket", url: "https://www.bigbasket.com/ps/?q=", suffix: "&nc=as", color: "bg-green-700" },
    { name: "Blinkit", url: "https://blinkit.com/s/?q=", color: "bg-yellow-400" },
];

const getStoreUrl = (storeName: string, ingredientName: string) => {
    const store = groceryStores.find(s => s.name === storeName);
    if (!store) return "#";
    const encodedIngredient = encodeURIComponent(ingredientName);
    return `${store.url}${encodedIngredient}${store.suffix || ''}`;
};


export function RecipeGenerator() {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [dietaryPreferences, setDietaryPreferences] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    highProtein: false,
  });
  const [generatedRecipe, setGeneratedRecipe] = useState<GenerateRecipeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalyzeIngredientsOutput | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [showIncompatibleDialog, setShowIncompatibleDialog] = useState(false);
  
  // States for vision feature
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isImageAnalysisLoading, setIsImageAnalysisLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { transcript, listening, isSpeechRecognitionSupported, startListening, stopListening } = useSpeechRecognition({
      onTranscriptChanged: setSearchTerm
  });
  const { toast } = useToast();
  const { addRecentRecipe } = useRecipeStore();
  
  const availableIngredients = useMemo(() => {
    return ingredientsData.filter(ingredient => {
      if (dietaryPreferences.vegetarian) {
        if (ingredient.tags.includes('animal-product') && !ingredient.tags.includes('dairy') && !ingredient.tags.includes('allergen:eggs') && ingredient.name !== 'honey') {
          return false;
        }
      }
      if (dietaryPreferences.vegan) {
        if (ingredient.tags.includes('animal-product') || ingredient.tags.includes('dairy')) {
          return false;
        }
      }
      if (dietaryPreferences.glutenFree) {
        if (ingredient.tags.includes('gluten') || ingredient.tags.includes('contains:wheat')) {
          return false;
        }
      }
      return true;
    });
  }, [dietaryPreferences]);

  useEffect(() => {
    // Deselect ingredients that are no longer available after a filter change
    setSelectedIngredients(prev => prev.filter(selected => availableIngredients.some(available => available.name === selected)));
  }, [availableIngredients]);
  
  useEffect(() => {
    let stream: MediaStream;
    const getCameraPermission = async () => {
      if (!isCameraOpen) {
        if (videoRef.current?.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({video: true});
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
      }
    };

    getCameraPermission();

    return () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [isCameraOpen]);


  const handleIngredientToggle = (ingredient: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(ingredient)
        ? prev.filter((i) => i !== ingredient)
        : [...prev, ingredient]
    );
  };

  const handlePreferenceToggle = (preference: keyof typeof dietaryPreferences) => {
    setDietaryPreferences((prev) => ({ ...prev, [preference]: !prev[preference] }));
  };
  
  const proceedWithGeneration = async () => {
    setIsLoading(true);
    setGeneratedRecipe(null);
    setAnalysisResult(null);
    setShowIncompatibleDialog(false);

    const input = {
      ingredients: selectedIngredients,
      ...dietaryPreferences,
    };

    const result = await handleGenerateRecipe(input);

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: result.error,
      });
      setGeneratedRecipe(null);
    } else if (result.data) {
       const recipeWithPrefs = { ...result.data, ...dietaryPreferences };
      setGeneratedRecipe(recipeWithPrefs);
      addRecentRecipe(recipeWithPrefs);
    }
    
    setIsLoading(false);
  }

  const handleSubmit = async () => {
    if (selectedIngredients.length === 0) {
      toast({
        variant: "destructive",
        title: "No Ingredients Selected",
        description: "Please select at least one ingredient to start.",
      });
      return;
    }
    
    setIsAnalysisLoading(true);
    setAnalysisResult(null);
    setGeneratedRecipe(null);

    const analysisInput = {
      ingredients: selectedIngredients,
      dietaryPreferences,
    };
    
    const analysisResult = await handleAnalyzeIngredients(analysisInput);
    setIsAnalysisLoading(false);

    if (analysisResult.error) {
        toast({ variant: "destructive", title: "Analysis Failed", description: analysisResult.error });
        return;
    }

    if (analysisResult.data) {
        setAnalysisResult(analysisResult.data);
        if (analysisResult.data.isCompatible) {
            if (!analysisResult.data.tasteSuggestions?.length) {
              proceedWithGeneration();
            }
        } else {
            setShowIncompatibleDialog(true);
        }
    }
  };
  
  const handleApplyAllSubstitutions = () => {
    if (!analysisResult?.substitutions) return;

    let newIngredients = [...selectedIngredients];
    analysisResult.substitutions.forEach(sub => {
        newIngredients = newIngredients.filter(i => i !== sub.ingredientToReplace);
        if (!newIngredients.includes(sub.suggestion)) {
            newIngredients.push(sub.suggestion);
        }
    });

    setSelectedIngredients(newIngredients);
    setShowIncompatibleDialog(false);
    setAnalysisResult(null);
    // You might want to automatically re-run analysis or generation here
    // For now, we'll let the user click "Generate" again.
  };

  const handleClearPantry = () => {
    setSelectedIngredients([]);
    setAnalysisResult(null);
  }

  const handleTakePicture = async () => {
     if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/png');
            
            setIsCameraOpen(false);
            setIsImageAnalysisLoading(true);

            const result = await handleAnalyzeImage({ photoDataUri: dataUrl, ingredientCatalog });
            setIsImageAnalysisLoading(false);

            if (result.error) {
                toast({ variant: "destructive", title: "Image Analysis Failed", description: result.error });
            } else if (result.data) {
                const foundIngredients = result.data.identifiedIngredients;
                setSelectedIngredients(prev => [...new Set([...prev, ...foundIngredients])]);
                toast({
                    title: "Ingredients Identified!",
                    description: `Added ${foundIngredients.length} ingredients to your list.`,
                });
            }
        }
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        
        setIsImageAnalysisLoading(true);
        const result = await handleAnalyzeImage({ photoDataUri: dataUrl, ingredientCatalog });
        setIsImageAnalysisLoading(false);

        if (result.error) {
          toast({ variant: "destructive", title: "Image Analysis Failed", description: result.error });
        } else if (result.data) {
          const foundIngredients = result.data.identifiedIngredients;
          setSelectedIngredients(prev => [...new Set([...prev, ...foundIngredients])]);
          toast({
            title: "Ingredients Identified!",
            description: `Added ${foundIngredients.length} ingredients from your uploaded image.`,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMicClick = () => {
    if (!isSpeechRecognitionSupported) {
        toast({
            variant: "destructive",
            title: "Browser Not Supported",
            description: "Your browser does not support speech recognition.",
        });
        return;
    }
    if (listening) {
        stopListening();
    } else {
        startListening();
    }
  }

  const filteredIngredients = availableIngredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          <Card className="bg-card/70">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">1. Choose Your Ingredients</CardTitle>
              <CardDescription>Select the items you have on hand. The list will update based on your diet.</CardDescription>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="flex-1"><Camera className="mr-2"/>Analyze with Camera</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Analyze Ingredients with Camera</DialogTitle>
                                <DialogDescription>
                                    Point your camera at your ingredients and snap a photo.
                                </DialogDescription>
                            </DialogHeader>
                            <div>
                                <video ref={videoRef} className="w-full aspect-video rounded-md bg-black" autoPlay muted />
                                <canvas ref={canvasRef} className="hidden" />
                                {hasCameraPermission === false && (
                                        <Alert variant="destructive" className="mt-4">
                                        <VideoOff className="h-4 w-4" />
                                        <AlertTitle>Camera Access Denied</AlertTitle>
                                        <AlertDescription>
                                            Please enable camera permissions in your browser settings.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                            <DialogFooter>
                                <Button onClick={handleTakePicture} disabled={!hasCameraPermission || isImageAnalysisLoading}>
                                    {isImageAnalysisLoading ? 'Analyzing...' : 'Take Picture & Analyze'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                    />
                    <Button variant="outline" className="flex-1" onClick={handleUploadClick}>
                        <Upload className="mr-2"/>Upload Image
                    </Button>
                </div>
                 {selectedIngredients.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={handleClearPantry} className="text-muted-foreground justify-start p-0 h-auto hover:bg-transparent">
                        <X className="mr-1 h-4 w-4"/>
                        Clear selected items
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative flex items-center gap-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search ingredients..."
                  className="pl-10 flex-1"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                 <Button variant="outline" size="icon" onClick={handleMicClick}>
                    <Mic className={cn("h-5 w-5", listening && "text-red-500 animate-pulse")} />
                 </Button>
              </div>
              <ScrollArea className="h-60 border rounded-md">
                <div className="p-1">
                  {filteredIngredients.map((ingredient) => (
                    <div key={ingredient.id} className="flex items-center justify-between p-2 rounded-md hover:bg-accent">
                        <div className="flex items-center space-x-3">
                            <Checkbox
                                id={ingredient.id}
                                checked={selectedIngredients.includes(ingredient.name)}
                                onCheckedChange={() => handleIngredientToggle(ingredient.name)}
                            />
                            <Label htmlFor={ingredient.id} className="cursor-pointer text-sm font-medium">{ingredient.name}</Label>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <ShoppingCart className="mr-2 h-4 w-4" /> Buy
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>Buy from:</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {groceryStores.map(store => (
                                     <DropdownMenuItem key={store.name} asChild>
                                        <a href={getStoreUrl(store.name, ingredient.name)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                            <span className={cn("w-2 h-2 rounded-full", store.color)}></span>
                                            {store.name}
                                        </a>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="bg-card/70">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">2. Set Dietary Preferences</CardTitle>
              <CardDescription>Tailor the recipe to your dietary needs.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.keys(dietaryPreferences).map((key) => (
                <div key={key} className="flex items-center justify-between p-3 border rounded-md">
                  <Label htmlFor={key} className="capitalize font-medium">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <Switch
                    id={key}
                    checked={dietaryPreferences[key as keyof typeof dietaryPreferences]}
                    onCheckedChange={() => handlePreferenceToggle(key as keyof typeof dietaryPreferences)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
          
          {(isAnalysisLoading || isImageAnalysisLoading) && (
             <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-300"><Utensils className="animate-pulse" />{isImageAnalysisLoading ? 'Analyzing Image...' : 'Analyzing Ingredients...'}</CardTitle>
                    <CardDescription className="text-blue-700 dark:text-blue-400">{isImageAnalysisLoading ? 'Our AI is identifying your ingredients from the photo.' : 'Our AI chef is checking your combination for taste and compatibility.'}</CardDescription>
                </CardHeader>
            </Card>
          )}

          {analysisResult && analysisResult.isCompatible && analysisResult.tasteSuggestions && analysisResult.tasteSuggestions.length > 0 && (
             <Card className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-300"><ThumbsUp/>Possible Combo!</CardTitle>
                    <CardDescription className="text-green-700 dark:text-green-400">This looks like a great start! Here are some suggestions to make it even better.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {analysisResult.tasteSuggestions.map((s, i) => (
                         <div key={i} className="flex items-start gap-3 p-2 rounded-md bg-green-100/50 dark:bg-green-900/30">
                            <Lightbulb className="w-5 h-5 mt-1 text-green-600 dark:text-green-400" />
                            <div>
                                <p className="font-semibold text-green-900 dark:text-green-200">{s.suggestion}</p>
                                <p className="text-sm text-green-800 dark:text-green-300">{s.reason}</p>
                            </div>
                        </div>
                    ))}
                    <Button onClick={proceedWithGeneration} className="w-full mt-4">Continue to Recipe</Button>
                </CardContent>
            </Card>
          )}

          <div>
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-semibold font-headline">Your Pantry</h3>
                {selectedIngredients.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={handleClearPantry} className="text-muted-foreground">
                        <Trash2 className="mr-2" />
                        Clear All
                    </Button>
                )}
            </div>
            <div className="p-4 rounded-lg border bg-card/50 min-h-[6rem] transition-all">
              {selectedIngredients.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedIngredients.map((ingredient) => (
                    <Badge key={ingredient} variant="secondary" className="text-base py-1 px-3">{ingredient}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm p-4 text-center">Your selected ingredients will show up here.</p>
              )}
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={isAnalysisLoading || isLoading || isImageAnalysisLoading} size="lg" className="w-full text-lg py-7 shadow-lg hover:shadow-primary/50 transition-shadow">
            {(isAnalysisLoading || isLoading || isImageAnalysisLoading) ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
            {isAnalysisLoading ? 'Analyzing...' : (isLoading ? 'Generating...' : (isImageAnalysisLoading ? 'Analyzing Image...': 'Generate Recipe'))}
          </Button>

        </div>

        <div className="lg:sticky lg:top-8 h-full min-h-[500px] lg:min-h-0">
          <RecipeDisplay recipe={generatedRecipe} isLoading={isLoading} />
        </div>

        <Dialog open={showIncompatibleDialog} onOpenChange={setShowIncompatibleDialog}>
             <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-start gap-3 text-destructive text-xl font-headline">
                        <TriangleAlert className="w-10 h-10" />
                        <div className="mt-1">
                            Impossible Combo
                            <DialogDescription className="pt-2 text-base text-left text-muted-foreground">
                                {analysisResult?.incompatibilityReason}
                            </DialogDescription>
                        </div>
                    </DialogTitle>
                </DialogHeader>
                {analysisResult?.substitutions && analysisResult.substitutions.length > 0 && (
                  <div className="py-2">
                      <h3 className="font-semibold mb-3 text-lg font-headline">Suggested Fix:</h3>
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2 bg-accent/50 p-3 rounded-md border">
                          {analysisResult.substitutions.map((sub, index) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                      <span className="text-muted-foreground line-through">{sub.ingredientToReplace}</span>
                                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                      <span className="font-semibold text-primary">{sub.suggestion}</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground text-right ml-2">{sub.reason}</p>
                              </div>
                          ))}
                      </div>
                  </div>
                )}
                <DialogFooter className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Button onClick={handleApplyAllSubstitutions}>Apply Suggestions</Button>
                    <Button variant="outline" onClick={() => proceedWithGeneration()}>Ignore & Proceed</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

      </div>
  );
}
