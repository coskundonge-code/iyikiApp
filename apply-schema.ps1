# apply-schema.ps1 - Apply iyiki-app Supabase schema
# 
# OPTION 1: Use Supabase Management API (requires Personal Access Token)
# Get your PAT from: https://supabase.com/dashboard/account/tokens
#
# Run: $env:SUPABASE_ACCESS_TOKEN = "sbp_xxx"; .\apply-schema.ps1
#
# OPTION 2: Use direct PostgreSQL connection (requires DB password)
# Get your DB password from: https://supabase.com/dashboard/project/krjrwxldiabjqumvocsv/settings/database
#
# Run: $env:DB_PASSWORD = "your-password"; .\apply-schema.ps1 -UseDbUrl

param([switch]$UseDbUrl)

$PROJECT_REF = "krjrwxldiabjqumvocsv"
$SCHEMA_FILE = Join-Path $PSScriptRoot "supabase\schema.sql"

if ($UseDbUrl) {
    $password = $env:DB_PASSWORD
    if (-not $password) {
        Write-Error "Set DB_PASSWORD environment variable"
        exit 1
    }
    $dbUrl = "postgresql://postgres.$PROJECT_REF:$password@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
    $env:SUPABASE_ACCESS_TOKEN = "placeholder"
    npx supabase db query --db-url $dbUrl -f $SCHEMA_FILE
} else {
    $pat = $env:SUPABASE_ACCESS_TOKEN
    if (-not $pat -or -not $pat.StartsWith("sbp_")) {
        Write-Error "Set SUPABASE_ACCESS_TOKEN to your Personal Access Token (sbp_xxx)"
        Write-Host "Get it from: https://supabase.com/dashboard/account/tokens"
        exit 1
    }
    
    $sql = Get-Content $SCHEMA_FILE -Raw
    $body = [System.Text.Encoding]::UTF8.GetBytes(($sql | ConvertTo-Json -Compress | ForEach-Object { "{`"query`":$_}" }))
    $headers = @{
        "Authorization" = "Bearer $pat"
        "Content-Type" = "application/json"
    }
    
    Write-Host "Applying schema to project: $PROJECT_REF"
    try {
        $response = Invoke-RestMethod `
            -Uri "https://api.supabase.com/v1/projects/$PROJECT_REF/database/query" `
            -Method POST `
            -Headers $headers `
            -Body $body
        Write-Host "SUCCESS! Schema applied successfully."
        Write-Output $response
    } catch {
        Write-Error "Failed: $($_.ErrorDetails.Message)"
        exit 1
    }
}