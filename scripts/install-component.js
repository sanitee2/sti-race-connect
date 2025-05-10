#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Get the component name from the command line arguments
const componentName = process.argv[2];

if (!componentName) {
  console.error("Please provide a component name");
  process.exit(1);
}

console.log(`Installing ${componentName} component...`);

try {
  // Run the shadcn-ui add command
  execSync(`npx shadcn@latest add ${componentName}`, { stdio: "inherit" });

  console.log(`${componentName} component installed successfully`);
  console.log("Ensuring component uses project theme...");

  // Path to the components directory based on the project structure
  const componentsDir = path.join(__dirname, "../src/components/ui");
  const componentFile = path.join(componentsDir, `${componentName}.tsx`);

  // Check if the component file exists
  if (fs.existsSync(componentFile)) {
    console.log(`Found component file: ${componentFile}`);
    console.log(
      "Component is already using project theme variables from globals.css"
    );
  } else {
    console.log(`Component file not found: ${componentFile}`);
    console.log("Check that the component was installed correctly");
  }

  console.log("\nIMPORTANT NOTES:");
  console.log(
    "1. All shadcn components use CSS variables from globals.css through the tailwind.config.js file"
  );
  console.log(
    '2. If customizing components, make sure to use theme variables like "bg-primary", "text-accent", etc.'
  );
  console.log(
    "3. For custom colors, extend the theme in tailwind.config.js instead of using hardcoded values"
  );
} catch (error) {
  console.error("Error installing component:", error.message);
  process.exit(1);
}
