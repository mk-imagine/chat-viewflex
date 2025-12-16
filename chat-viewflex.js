const targetClasses = [
	"conversation-container",
	"message-actions-hover-boundary",
	"ng-star-inserted",
];

let totalModifications = 0;
let conversationWidth = 80; // Default width in rem

// Detect which site we're on
const isChatGPT = window.location.hostname.includes("chatgpt.com") ||
                  window.location.hostname.includes("openai.com");
const isGemini = window.location.hostname.includes("gemini.google.com");
const isClaude = window.location.hostname.includes("claude.ai");

// Determine site identifier for storage
let currentSite = 'default';
if (isGemini) currentSite = 'gemini';
else if (isChatGPT) currentSite = 'chatgpt';
else if (isClaude) currentSite = 'claude';

// Load settings from storage for current site
browser.storage.sync.get(['widthSettings']).then((result) => {
	if (result.widthSettings && result.widthSettings[currentSite]) {
		conversationWidth = result.widthSettings[currentSite];
		console.log(`Loaded conversation width for ${currentSite}: ${conversationWidth}rem`);
		// Reapply width to existing elements
		reapplyAllWidths();
	} else {
		console.log(`Using default conversation width for ${currentSite}: ${conversationWidth}rem`);
	}
}).catch((error) => {
	console.error('Error loading settings:', error);
});

// Listen for width updates from popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === 'updateWidth') {
		conversationWidth = message.width;
		console.log(`Updated conversation width for ${currentSite}: ${conversationWidth}rem`);
		reapplyAllWidths();
	}
});

const targetsToModify = [
	// Gemini-specific targets
	{
		name: "inputAreaContainer",
		classes: ["input-area-container", "ng-star-inserted"],
		enabled: isGemini,
		action: (element) => {
			element.style.maxWidth = `${conversationWidth}rem`;
			console.log(
				`Modified 'inputAreaContainer': ${element.tagName}#${
					element.id || ""
				}. Set max-width to ${conversationWidth}rem`
			);
			totalModifications++;
		},
	},
	{
		name: "conversationContainer",
		classes: [
			"conversation-container",
			"ng-star-inserted",
		],
		enabled: isGemini,
		action: (element) => {
			element.style.maxWidth = `${conversationWidth}rem`;
			console.log(
				`Modified 'conversationContainer': ${element.tagName}#${
					element.id || ""
				}. Set max-width to ${conversationWidth}rem`
			);
			totalModifications++;
		},
	},
    // "userQueryTag" controls the width of the entire row that the userQueryBubble sits in
	{
		name: "userQueryTag",
		tagName: "user-query",
		classes: ["ng-star-inserted"],
		enabled: isGemini,
		action: (element) => {
			element.style.maxWidth = `${conversationWidth}rem`;
			console.log(
				`Modified 'userQueryTag': ${element.tagName}#${
					element.id || ""
				}. Set max-width to ${conversationWidth}rem`
			);
			totalModifications++;
		},
	},
    // "userQueryBubble" controls the width of the bubble
	{
		name: "userQueryBubble",
		classes: ["user-query-bubble-with-background", "ng-star-inserted"],
		enabled: isGemini,
		action: (element) => {
			element.style.maxWidth = "50rem";
			console.log(
				`Modified 'userQueryBubble': ${element.tagName}#${
					element.id || ""
				}. Set max-width to "50rem"`
			);
			totalModifications++;
		},
	},
	// ChatGPT-specific targets
	{
		name: "chatGPTConversation",
		enabled: isChatGPT,
		customMatcher: (element) => {
			// Match elements that have the thread-content-max-width CSS variable class
			return element.className &&
			       element.className.includes('--thread-content-max-width');
		},
		action: (element) => {
			element.style.setProperty("--thread-content-max-width", `${conversationWidth}rem`);
			console.log(
				`Modified 'chatGPTConversation': ${element.tagName}#${
					element.id || ""
				}. Set --thread-content-max-width to ${conversationWidth}rem`
			);
			totalModifications++;
		},
	},
	// Claude-specific targets
	{
		name: "claudeConversation",
		classes: ["max-w-3xl"],
		enabled: isClaude,
		action: (element) => {
			element.style.maxWidth = `${conversationWidth}rem`;
			console.log(
				`Modified 'claudeConversation': ${element.tagName}#${
					element.id || ""
				}. Set max-width to ${conversationWidth}rem`
			);
			totalModifications++;
		},
	},
];

// Function to check if an element has all the target classes
function matchesCriteria(element, target) {
	if (!element || typeof element.matches !== "function") return false;

	// 0. Check if target is enabled for current site
	if (target.enabled === false) {
		return false;
	}

	// 1. If target has a custom matcher, use that instead
	if (target.customMatcher && typeof target.customMatcher === "function") {
		return target.customMatcher(element);
	}

	// 2. Check tag name (if specified in target)
	if (
		target.tagName &&
		element.tagName.toLowerCase() !== target.tagName.toLowerCase()
	) {
		return false;
	}

	// 3. Check classes (if specified in target)
	if (target.classes && target.classes.length > 0) {
		for (const cls of target.classes) {
			if (!element.classList.contains(cls)) {
				return false;
			}
		}
	}
	return true;
}

let observer;

// Function to check a node against all targets and process if matched
function checkAndProcessNode(node) {
	if (node.nodeType !== 1) return false; // Only process element nodes

	let modifiedThisNode = false;
	targetsToModify.forEach((target) => {
		if (matchesCriteria(node, target)) {
			target.action(node);
			modifiedThisNode = true;
		}
	});
	return modifiedThisNode;
}

// Function to reapply widths to all existing elements
function reapplyAllWidths() {
	console.log("Reapplying widths to all elements...");
	targetsToModify.forEach((target) => {
		// Skip if target is disabled
		if (target.enabled === false) {
			return;
		}

		// If target has a custom matcher, scan all divs
		if (target.customMatcher) {
			const elements = document.querySelectorAll('div');
			elements.forEach((element) => {
				if (matchesCriteria(element, target)) {
					target.action(element);
				}
			});
			return;
		}

		// Construct selector for regular targets
		let selector = "";
		if (target.tagName) {
			selector += target.tagName;
		}
		if (target.classes && target.classes.length > 0) {
			selector += target.classes.map((cls) => `.${cls}`).join("");
		}

		if (selector) {
			const elements = document.querySelectorAll(selector);
			elements.forEach((element) => {
				if (matchesCriteria(element, target)) {
					target.action(element);
				}
			});
		}
	});
}

// Function to update the log
function updateLog() {
	const logElement = document.getElementById("log");
	if (logElement) {
		const observerStatus = observer ? "active" : "disconnected";
		logElement.textContent = `Observer status: ${observerStatus}. Total modifications: ${totalModifications}. Monitoring...`;
	}
	// If the observer needs to be disconnected based on some other condition,
	// logic can be added here.  Currently, it runs indefinitely.
}

// Function to scan the DOM for initially loaded target elements
function initialScanAndModify() {
	console.log("Performing initial scan for elements already in DOM...");

	targetsToModify.forEach((target) => {
		// Skip if target is disabled
		if (target.enabled === false) {
			return;
		}

		// If target has a custom matcher, scan all divs and check each one
		if (target.customMatcher) {
			try {
				const elements = document.querySelectorAll('div');
				elements.forEach((elementNode) => {
					checkAndProcessNode(elementNode);
				});
			} catch (e) {
				console.error(
					`Error during custom matcher scan for target "${target.name}":`,
					e
				);
			}
			return;
		}

		// Construct selector considering tagName and classes
		let selector = "";
		if (target.tagName) {
			selector += target.tagName;
		}
        
		if (target.classes && target.classes.length > 0) {
			selector += target.classes.map((cls) => `.${cls}`).join("");
		} else if (
			!target.tagName &&
			(!target.classes || target.classes.length === 0)
		) {
			console.warn(
				`Target "${target.name}" has no tagName or classes for selector.`
			);
			return;
		}

		try {
			if (selector) {
				// Ensure selector is not empty
				const elements = document.querySelectorAll(selector);
				elements.forEach((elementNode) => {
					checkAndProcessNode(elementNode);
				});
			}
		} catch (e) {
			console.error(
				`Error during selector query ("${selector}") in initial scan for target "${target.name}":`,
				e
			);
		}
	});

	updateLog();
}

// MutationObserver callback
const mutationCallback = (mutationsList, obs) => {
	let processedInBatch = false;
	for (const mutation of mutationsList) {
		if (mutation.type === "childList") {
			mutation.addedNodes.forEach((node) => {
				if (checkAndProcessNode(node)) {
					processedInBatch = true;
				}
				// Also check descendant nodes if a complex tree was added
				if (
					node.nodeType === 1 &&
					typeof node.querySelectorAll === "function"
				) {
					targetsToModify.forEach((target) => {
						// Skip if target is disabled
						if (target.enabled === false) {
							return;
						}

						// For custom matchers, check all div descendants
						if (target.customMatcher) {
							node.querySelectorAll('div').forEach((descendantNode) => {
								if (checkAndProcessNode(descendantNode)) {
									processedInBatch = true;
								}
							});
							return;
						}

						// For regular targets, construct selector
						let querySelectorForDescendants = "";
						if (target.tagName) {
							querySelectorForDescendants += target.tagName;
						}
						if (target.classes && target.classes.length > 0) {
							querySelectorForDescendants += target.classes
								.map((cls) => `.${cls}`)
								.join("");
						}
						if (querySelectorForDescendants) {
							node.querySelectorAll(
								querySelectorForDescendants
							).forEach((descendantNode) => {
								if (checkAndProcessNode(descendantNode)) {
									processedInBatch = true;
								}
							});
						}
					});
				}
			});
		}
	}
	if (processedInBatch) {
		updateLog();
	}
};

observer = new MutationObserver(mutationCallback);
const config = {
	childList: true,
	subtree: true,
};

// Ensure the script runs after the DOM is ready for the initial scan
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", () => {
		observer.observe(document.body, config);
		console.log("MutationObserver is active.");
		initialScanAndModify();
	});
} else {
	observer.observe(document.body, config);
	console.log("MutationObserver is active.");
	initialScanAndModify();
}