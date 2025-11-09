<?php
// Get the current list tab, default to 'ready-to-ship'
$list_tab = isset($_GET['list_tab']) ? sanitize_key($_GET['list_tab']) : 'ready-to-ship';
?>
<div class="wrap oms-barcode-scanner-wrap">
    <h1>Barcode Scanner</h1>

    <!-- NEW: List Controls Header (Subtabs) -->
    <div class="oms-list-controls">
        <div class="oms-list-subtabs">
            <a href="?page=oms-barcode-scanner&list_tab=ready-to-ship" 
               class="oms-list-subtab <?php echo $list_tab == 'ready-to-ship' ? 'active' : ''; ?>" 
               data-target-tab="#scan-tab-ready-to-ship">
                Scan to Ready to Ship
            </a>
            <a href="?page=oms-barcode-scanner&list_tab=shipped" 
               class="oms-list-subtab <?php echo $list_tab == 'shipped' ? 'active' : ''; ?>" 
               data-target-tab="#scan-tab-shipped">
                Scan to Shipped
            </a>
        </div>
    </div>
    <div class="clear"></div>


    <!-- Tab Content: Ready to Ship -->
    <div id="scan-tab-ready-to-ship" class="oms-tab-content <?php echo $list_tab == 'ready-to-ship' ? 'active' : ''; ?>">
        <div class="oms-summary-section-stack">
            <!-- Card 1: Scanner -->
            <div class="oms-card oms-return-scanner-card">
                <h2>Scan to "Ready to Ship"</h2>
                <input type="text" id="barcode-input-ready-to-ship" class="oms-barcode-input" placeholder="Scan or type order number and press Enter..." data-target-status="ready-to-ship" autocomplete="off">
                <div id="feedback-ready-to-ship" class="oms-scan-feedback" style="display: none;"></div>
            </div>
            
            <!-- Card 2: Scan Stats -->
            <div class="oms-card">
                <div class="oms-scan-stats-grid">
                    <div class="oms-scan-stat-card stat-total">
                        <div class="oms-scan-stat-card-info">
                            <h3>Total Scans</h3>
                            <span class="oms-scan-stat-count" id="scan-total-count-ready-to-ship">0</span>
                        </div>
                        <div class="oms-scan-stat-card-icon">
                            <span class="dashicons dashicons-controls-repeat"></span>
                        </div>
                    </div>
                    <div class="oms-scan-stat-card stat-success">
                        <div class="oms-scan-stat-card-info">
                            <h3>Successful</h3>
                            <span class="oms-scan-stat-count" id="scan-success-count-ready-to-ship">0</span>
                        </div>
                        <div class="oms-scan-stat-card-icon">
                            <span class="dashicons dashicons-yes-alt"></span>
                        </div>
                    </div>
                    <div class="oms-scan-stat-card stat-fail">
                        <div class="oms-scan-stat-card-info">
                            <h3>Failed</h3>
                            <span class="oms-scan-stat-count" id="scan-fail-count-ready-to-ship">0</span>
                        </div>
                        <div class="oms-scan-stat-card-icon">
                            <span class="dashicons dashicons-dismiss"></span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Card 3: Scan Log -->
            <div class="oms-card oms-scan-log-card">
                <h3>Last 5 Scan Log (Ready to Ship)</h3>
                <table class="wp-list-table widefat fixed striped">
                    <thead>
                        <tr>
                            <th style="width: 20%;">Time</th>
                            <th style="width: 20%;">Order #</th>
                            <th style="width: 40%;">Result</th>
                            <th style="width: 20%;">Previous Status</th>
                        </tr>
                    </thead>
                    <tbody id="log-ready-to-ship">
                        <!-- Log entries will be added here by JavaScript -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Tab Content: Shipped -->
    <div id="scan-tab-shipped" class="oms-tab-content <?php echo $list_tab == 'shipped' ? 'active' : ''; ?>">
        <div class="oms-summary-section-stack">
            <!-- Card 1: Scanner -->
            <div class="oms-card oms-return-scanner-card">
                <h2>Scan to "Shipped"</h2>
                <input type="text" id="barcode-input-shipped" class="oms-barcode-input" placeholder="Scan or type order number and press Enter..." data-target-status="shipped" autocomplete="off">
                <div id="feedback-shipped" class="oms-scan-feedback" style="display: none;"></div>
            </div>
            
            <!-- Card 2: Scan Stats -->
            <div class="oms-card">
                <div class="oms-scan-stats-grid">
                    <div class="oms-scan-stat-card stat-total">
                        <div class="oms-scan-stat-card-info">
                            <h3>Total Scans</h3>
                            <span class="oms-scan-stat-count" id="scan-total-count-shipped">0</span>
                        </div>
                        <div class="oms-scan-stat-card-icon">
                            <span class="dashicons dashicons-controls-repeat"></span>
                        </div>
                    </div>
                    <div class="oms-scan-stat-card stat-success">
                        <div class="oms-scan-stat-card-info">
                            <h3>Successful</h3>
                            <span class="oms-scan-stat-count" id="scan-success-count-shipped">0</span>
                        </div>
                        <div class="oms-scan-stat-card-icon">
                            <span class="dashicons dashicons-yes-alt"></span>
                        </div>
                    </div>
                    <div class="oms-scan-stat-card stat-fail">
                        <div class="oms-scan-stat-card-info">
                            <h3>Failed</h3>
                            <span class="oms-scan-stat-count" id="scan-fail-count-shipped">0</span>
                        </div>
                        <div class="oms-scan-stat-card-icon">
                            <span class="dashicons dashicons-dismiss"></span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Card 3: Scan Log -->
            <div class="oms-card oms-scan-log-card">
                <h3>Last 5 Scan Log (Shipped)</h3>
                <table class="wp-list-table widefat fixed striped">
                    <thead>
                        <tr>
                            <th style="width: 20%;">Time</th>
                            <th style="width: 20%;">Order #</th>
                            <th style="width: 40%;">Result</th>
                            <th style="width: 20%;">Previous Status</th>
                        </tr>
                    </thead>
                    <tbody id="log-shipped">
                        <!-- Log entries will be added here by JavaScript -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Audio cues for feedback -->
    <audio id="oms-audio-success" src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" preload="auto"></audio>
    <audio id="oms-audio-error" src="https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg" preload="auto"></audio>
</div>