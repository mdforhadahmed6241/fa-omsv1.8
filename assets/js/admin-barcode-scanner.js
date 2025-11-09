jQuery(function ($) {
    const ajaxUrl = oms_barcode_scanner_data.ajax_url;
    const nonce = oms_barcode_scanner_data.nonce;
    const successSound = document.getElementById('oms-audio-success');
    const errorSound = document.getElementById('oms-audio-error');

    // --- Tab Functionality ---
    const tabs = $('.oms-list-subtab');
    const tabContents = $('.oms-tab-content');

    tabs.on('click', function (e) {
        e.preventDefault();
        
        // Update URL for deep linking
        const newUrl = $(this).attr('href');
        if (window.history.pushState) {
            window.history.pushState({path:newUrl}, '', newUrl);
        }

        tabs.removeClass('active');
        $(this).addClass('active');
        const target = $(this).data('target-tab');
        
        tabContents.removeClass('active').hide();
        $(target).addClass('active').show();
        $(target).find('.oms-barcode-input').focus();
    });

    // Initial focus based on active tab
    $('.oms-tab-content.active .oms-barcode-input').focus();

    // --- Scan Counters (one set for each tab) ---
    const scanCounters = {
        'ready-to-ship': { total: 0, success: 0, fail: 0 },
        'shipped': { total: 0, success: 0, fail: 0 }
    };

    // --- Barcode Scanning Logic ---
    $('.oms-barcode-input').on('keypress', function (e) {
        if (e.which === 13) { // Enter key pressed
            e.preventDefault();
            const $input = $(this);
            const orderNumber = $input.val().trim();
            const targetStatus = $input.data('target-status'); // 'ready-to-ship' or 'shipped'
            
            const $feedbackEl = $('#feedback-' + targetStatus);
            const $logTableBody = $('#log-' + targetStatus);
            
            // Get the correct counter elements
            const $totalCountEl = $('#scan-total-count-' + targetStatus);
            const $successCountEl = $('#scan-success-count-' + targetStatus);
            const $failCountEl = $('#scan-fail-count-' + targetStatus);

            if (!orderNumber) {
                return;
            }

            $input.prop('disabled', true);
            $feedbackEl.removeClass('success error warning').addClass('loading').text('Processing...').show();
            
            // Increment total scan count for this tab
            scanCounters[targetStatus].total++;
            $totalCountEl.text(scanCounters[targetStatus].total);

            $.ajax({
                url: ajaxUrl,
                type: 'POST',
                data: {
                    action: 'oms_ajax_update_status_from_scan',
                    nonce: nonce,
                    order_number: orderNumber,
                    target_status: targetStatus
                },
                success: function (response) {
                    if (response.success) {
                        const { status, message, order_id, order_number, previous_status_name } = response.data;
                        let feedbackClass = 'warning'; // Default for skipped
                        let logClass = 'skipped';
                        
                        if (status === 'success') {
                            feedbackClass = 'success';
                            logClass = 'success';
                            if(successSound) successSound.play();
                            // Increment success count
                            scanCounters[targetStatus].success++;
                            $successCountEl.text(scanCounters[targetStatus].success);
                        } else {
                            // This covers 'skipped'
                            if(errorSound) errorSound.play();
                            // Increment fail count
                            scanCounters[targetStatus].fail++;
                            $failCountEl.text(scanCounters[targetStatus].fail);
                        }
                        
                        $feedbackEl.removeClass('loading').addClass(feedbackClass).text(message);
                        addLogRow($logTableBody, order_id, order_number, message, previous_status_name, logClass);

                    } else {
                        // AJAX call succeeded but WP returned an error
                        if(errorSound) errorSound.play();
                        // Increment fail count
                        scanCounters[targetStatus].fail++;
                        $failCountEl.text(scanCounters[targetStatus].fail);
                        $feedbackEl.removeClass('loading').addClass('error').text(response.data.message);
                        addLogRow($logTableBody, '#', orderNumber, response.data.message, 'N/A', 'error');
                    }
                },
                error: function () {
                    if(errorSound) errorSound.play();
                    // Increment fail count
                    scanCounters[targetStatus].fail++;
                    $failCountEl.text(scanCounters[targetStatus].fail);
                    $feedbackEl.removeClass('loading').addClass('error').text('An unknown AJAX error occurred.');
                    addLogRow($logTableBody, '#', orderNumber, 'AJAX Error', 'N/A', 'error');
                },
                complete: function () {
                    $input.prop('disabled', false).val('').focus();
                    setTimeout(() => $feedbackEl.fadeOut(), 4000);
                }
            });
        }
    });

    function addLogRow($tableBody, orderId, orderNumber, result, prevStatus, statusClass) {
        const currentTime = new Date().toLocaleTimeString();
        const newRow = `
            <tr class="oms-log-row--${statusClass}">
                <td>${currentTime}</td>
                <td><a href="/wp-admin/admin.php?page=oms-order-details&order_id=${orderId}" target="_blank">#${orderNumber}</a></td>
                <td>${result}</td>
                <td>${prevStatus}</td>
            </tr>
        `;
        $tableBody.prepend(newRow);

        // Keep the log to a reasonable size
        if ($tableBody.children('tr').length > 5) {
            $tableBody.children('tr:last').remove();
        }
    }
});