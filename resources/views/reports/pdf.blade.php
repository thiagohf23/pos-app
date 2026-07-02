<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Sales Report</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #333; margin: 40px; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        .subtitle { font-size: 11px; color: #888; margin-bottom: 24px; }
        .cards { display: flex; gap: 12px; margin-bottom: 24px; }
        .card { flex: 1; border: 1px solid #ddd; border-radius: 6px; padding: 12px; }
        .card-label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
        .card-value { font-size: 18px; font-weight: bold; margin-top: 4px; }
        h2 { font-size: 14px; margin-top: 20px; margin-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th, td { padding: 6px 8px; border-bottom: 1px solid #eee; text-align: left; }
        th { font-size: 10px; color: #888; text-transform: uppercase; }
        td { font-size: 11px; }
        .text-right { text-align: right; }
        .chart-bar { display: inline-block; height: 14px; background: #333; border-radius: 2px; }
    </style>
</head>
<body>
    <h1>Sales Report</h1>
    <div class="subtitle">
        {{ $startDate }} — {{ $endDate }}
        @if(!empty($activeFilters))
            &nbsp;·&nbsp; {{ implode(' · ', $activeFilters) }}
        @endif
    </div>

    <div class="cards">
        <div class="card">
            <div class="card-label">Total Sales</div>
            <div class="card-value">{{ number_format($summary['total_sales']) }}</div>
        </div>
        <div class="card">
            <div class="card-label">Total Revenue</div>
            <div class="card-value">R$ {{ number_format($summary['total_revenue'], 2, ',', '.') }}</div>
        </div>
        <div class="card">
            <div class="card-label">Discounts</div>
            <div class="card-value">R$ {{ number_format($summary['total_discount'], 2, ',', '.') }}</div>
        </div>
        <div class="card">
            <div class="card-label">Avg Ticket</div>
            <div class="card-value">R$ {{ number_format($summary['average_ticket'], 2, ',', '.') }}</div>
        </div>
    </div>

    @if($topProducts->count())
    <h2>Top Selling Products</h2>
    <table>
        <thead>
            <tr>
                <th>Product</th>
                <th class="text-right">Qty Sold</th>
                <th class="text-right">Revenue</th>
            </tr>
        </thead>
        <tbody>
            @foreach($topProducts as $item)
            <tr>
                <td>{{ $item->product_name ?? 'N/A' }}</td>
                <td class="text-right">{{ $item->total_quantity }}</td>
                <td class="text-right">R$ {{ number_format($item->total_revenue, 2, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    @if($paymentMethods->count())
    <h2>Sales by Payment Method</h2>
    <table>
        <thead>
            <tr>
                <th>Method</th>
                <th class="text-right">Count</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($paymentMethods as $method)
            <tr>
                <td>{{ ucfirst(str_replace('_', ' ', $method->payment_method)) }}</td>
                <td class="text-right">{{ $method->count }}</td>
                <td class="text-right">R$ {{ number_format($method->total, 2, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    @if($dailySales->count())
    <h2>Daily Sales</h2>
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th class="text-right">Sales</th>
                <th class="text-right">Revenue</th>
            </tr>
        </thead>
        <tbody>
            @foreach($dailySales as $day)
            <tr>
                <td>{{ $day->date }}</td>
                <td class="text-right">{{ $day->count }}</td>
                <td class="text-right">R$ {{ number_format($day->total, 2, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif
</body>
</html>
