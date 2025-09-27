Publish messages to different types of exchanges.

scenario example:
publisher: publish notifications data
different consumers will pick based on notification send channel: email/sms
and one cosumer will pick all the notifications as it is doing logging task.

===
fanout exchange for logging all notifications
direct exchange for notification.email and for notification.sms
topic exchange: for notification.# (think creative)
headers exchange:
    >> {type=alert, actionrequired=true, x-match=any}
    >> {type=alert, actionrequired=true, x-match=all}


routing key: notification.email, notification.sms, notification.#
headers: type, actionRequired