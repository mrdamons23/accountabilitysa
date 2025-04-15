# Update Auth Scripts PowerShell Script
# This script adds the auth.js, header.js, and profile-utils.js scripts to all HTML files

# Get all HTML files except account.html (which we've already updated)
$htmlFiles = Get-ChildItem -Filter "*.html" | Where-Object { $_.Name -ne "account.html" }

$scriptBlock = @"
    <!-- Auth scripts should be loaded first -->
    <script src="js/auth.js"></script>
    <script src="js/header.js"></script>
    <script src="js/profile-utils.js"></script>
</head>
"@

Write-Host "Updating authentication scripts in HTML files..."

foreach ($file in $htmlFiles) {
    Write-Host "Processing $($file.Name)..."
    
    # Read the file content
    $content = Get-Content -Path $file.FullName -Raw
    
    # Skip if the file already has the auth scripts
    if ($content -match "js/auth.js" -and $content -match "js/header.js" -and $content -match "js/profile-utils.js") {
        Write-Host "  Already has auth scripts, skipping."
        continue
    }
    
    # Replace the closing head tag with our script block
    $updatedContent = $content -replace "</head>", $scriptBlock
    
    # Write the updated content back to the file
    $updatedContent | Set-Content -Path $file.FullName
    
    Write-Host "  Updated successfully."
}

Write-Host "All files updated successfully!" 