jQuery(document).ready(function($) {
    const data = oms_return_data;
    const ajaxUrl = data.ajax_url;
    const nonce = data.nonce;
    const scanNonce = data.scan_nonce;
    const successSound = document.getElementById('oms-audio-success');
    const errorSound = document.getElementById('oms-audio-error');

    // --- Summary Date Filter Logic (Simplified) ---
    // Custom range logic removed to match screenshot
    const filterSelect = $('#filter-select');
    // ADDED BACK: Logic for custom date range
    const startDateInput = $('#start_date');
    const endDateInput = $('#end_date');
    const startDateLabel = $('label[for="start_date"]');
    const endDateLabel = $('label[for="end_date"]');

    function toggleCustomRange() {
        if (filterSelect.val() === 'custom') {
            startDateInput.show();
            endDateInput.show();
            startDateLabel.show();
            endDateLabel.show();
        } else {
            startDateInput.hide();
            endDateInput.hide();
            startDateLabel.hide();
            endDateLabel.hide();
        }
    }

    filterSelect.on('change', toggleCustomRange);
    toggleCustomRange(); // Initial state check
    // END: Added back logic

    // --- Return List Button Action ---
    $('.oms-update-return-btn').on('click', function(e) {
        e.preventDefault();
        const $button = $(this);
        const orderId = $button.data('order-id');
        const newStatus = $button.data('status');
        const oldText = $button.text();
        const listTab = $button.closest('.oms-tab-content').find('.nav-tab-active').data('list-tab');

        $button.prop('disabled', true).text(newStatus == 1 ? 'Receiving...' : 'Updating...');

        $.ajax({
            url: ajaxUrl,
            type: 'POST',
            data: {
                action: 'oms_ajax_update_return_status',
                nonce: nonce,
                order_id: orderId,
                receive_status: newStatus
            },
            success: function(response) {
                if (response.success) {
                    if (newStatus == 1 && listTab === 'not-received') {
                         // If moving from Not Received to Received, remove the row for a dynamic feel
                         $button.closest('tr').fadeOut(300, function() {
                            $(this).remove();
                             // Simple success message on the top (optional)
                             $('.wrap > h1').after('<div class="notice notice-success is-dismissible oms-notice"><p>Order #' + orderId + ' successfully marked as Received.</p></div>');
                        });
                    } else {
                        // For other moves (e.g., in Received tab or marked back to Not Received) refresh the page
                        window.location.reload();
                    }
                } else {
                    alert('Error: ' + (response.data.message || 'Could not update status.'));
                    $button.prop('disabled', false).text(oldText);
                }
            },
            error: function() {
                alert('An AJAX error occurred.');
                $button.prop('disabled', false).text(oldText);
            }
        });
    });

    // --- Return Scanner Logic (Summary Tab) ---
    const $scanInput = $('#return-scan-input');
    const $logTableBody = $('#return-scan-log');
    const $totalCountEl = $('#scan-total-count');
    const $successCountEl = $('#scan-success-count');
    const $failCountEl = $('#scan-fail-count');
    
    let totalScans = 0;
    let successScans = 0;
    let failScans = 0;

    $scanInput.on('keypress', function (e) {
        if (e.which === 13) { // Enter key pressed
            e.preventDefault();
            const $input = $(this);
            const orderNumber = $input.val().trim();
            
            if (!orderNumber) { return; }

            $input.prop('disabled', true);
            
            totalScans++;
            $totalCountEl.text(totalScans);

            $.ajax({
                url: ajaxUrl,
                type: 'POST',
                data: {
                    action: 'oms_ajax_return_scan',
                    nonce: scanNonce,
                    order_number: orderNumber,
                },
                success: function (response) {
                    if (response.success) {
                        const { status, message, order_id, order_number } = response.data;
                        
                        if (status === 'success') {
                            if(successSound) successSound.play();
                            successScans++;
                            $successCountEl.text(successScans);
                            addReturnLogRow($logTableBody, order_id, order_number, message, 'success');
                            // Refresh summary stats on success
                            refreshSummaryStats();
                        } else {
                            // This covers 'skipped'
                            if(errorSound) errorSound.play();
                            failScans++;
                            $failCountEl.text(failScans);
                            addReturnLogRow($logTableBody, order_id, order_number, message, 'skipped');
                        }

                    } else {
                        // AJAX call succeeded but WP returned an error
                        if(errorSound) errorSound.play();
                        failScans++;
                        $failCountEl.text(failScans);
                        addReturnLogRow($logTableBody, '#', orderNumber, response.data.message, 'error');
                    }
                },
                error: function () {
                    if(errorSound) errorSound.play();
                    failScans++;
                    $failCountEl.text(failScans);
                    addReturnLogRow($logTableBody, '#', orderNumber, 'AJAX Error', 'error');
                },
                complete: function () {
                    $input.prop('disabled', false).val('').focus();
                }
            });
        }
    });
    
    function addReturnLogRow($tableBody, orderId, orderNumber, result, statusClass) {
        const currentTime = new Date().toLocaleTimeString();
        const newRow = `
            <tr class="oms-log-row--${statusClass}">
                <td>${currentTime}</td>
                <td><a href="/wp-admin/admin.php?page=oms-order-details&order_id=${orderId}" target="_blank">#${orderNumber}</a></td>
                <td>${result}</td>
            </tr>
        `;
        $tableBody.prepend(newRow);

        // Keep the log to a reasonable size (e.g., 5 items)
        if ($tableBody.children('tr').length > 5) {
            $tableBody.children('tr:last').remove();
        }
    }
    
    // Function to refresh summary stats without a full page reload
    function refreshSummaryStats() {
        // We can't know the full stats without re-querying, 
        // but we can update the visible counters if the user is on the default filter ("today")
        if (filterSelect.val() === 'today') {
            const $receivedStat = $('.oms-summary-stat-box .stat-green');
            const $notReceivedStat = $('.oms-summary-stat-box .stat-red');
            
            let currentReceived = parseInt($receivedStat.text()) || 0;
            let currentNotReceived = parseInt($notReceivedStat.text()) || 0;

            // This assumes a scan moves one from "Not Received" to "Received"
            if (currentNotReceived > 0) {
                $receivedStat.text(currentReceived + 1);
                $notReceivedStat.text(currentNotReceived - 1);
            }
        }
        // If not on 'today', a full refresh might be needed, but this provides instant feedback.
    }
});