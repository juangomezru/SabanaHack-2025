Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$BaseUri = 'http://localhost:5000'

function Send-Invoice {
    param(
        [Parameter(Mandatory=$true)][string]$invoiceId,
        [Parameter(Mandatory=$true)][string]$name,
        [Parameter(Mandatory=$true)][string]$docNum
    )

    $body = @{
        invoiceId = $invoiceId
        client = @{
            registrationName = $name
            name = $name
            documentType = '13'
            documentNumber = $docNum
            address = @{ cityName = 'BOGOTA'; countrySubentity = '11'; countryCode = 'CO' }
        }
        items = @(@{ description='Servicio de asesoria tecnica'; quantity=1; unitCode='NIU'; price=150000 })
        paymentDueDate = '2025-11-15'
        taxRate = 0.19
    } | ConvertTo-Json -Depth 6

    $utf8 = [System.Text.Encoding]::UTF8.GetBytes($body)
    $resp = Invoke-RestMethod -Method Post -Uri "$BaseUri/api/invoices" -ContentType 'application/json; charset=utf-8' -Body $utf8
    Write-Host ("Created invoice {0} payable={1}" -f $resp.invoiceId, $resp.payableAmount)
}

Write-Host 'Posting 3 invoices...'
Send-Invoice -invoiceId 'PN1010' -name 'MARIA LOPEZ' -docNum '987654321'
Send-Invoice -invoiceId 'PN1011' -name 'JUAN PEREZ' -docNum '123456789'
Send-Invoice -invoiceId 'PN1012' -name 'CARLOS GOMEZ' -docNum '555222333'

Write-Host 'Fetching invoices and clients...'
$invoices = Invoke-RestMethod -Uri "$BaseUri/api/invoices"
$clients = Invoke-RestMethod -Uri "$BaseUri/api/clients"

Write-Host ("Invoices count: {0}" -f ($invoices.invoices | Measure-Object | Select-Object -ExpandProperty Count))
Write-Host ("Clients count: {0}" -f ($clients.clients | Measure-Object | Select-Object -ExpandProperty Count))

"First 3 invoices:" | Write-Host
($invoices.invoices | Select-Object -First 3 | ConvertTo-Json -Depth 4)


