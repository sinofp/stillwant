/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
document.addEventListener('DOMContentLoaded', function () {
  const isFirefox = navigator.userAgent.includes('Firefox')
  const popupList = document.getElementById('popup-content')
  let bookmarks = []

  function listenEvents () {
    document.addEventListener('click', e => {
      if (e.target.nodeName === 'BUTTON') {
        if ('Refresh' == e.target.textContent) {
          select5AndDisplay()
        } else {
          const bookmarkDiv = document.getElementById(
            parseInt(e.target.getAttribute('id')) + 'bookmark'
          )
          switch (e.target.textContent) {
            case 'Delete':
              browser.bookmarks.remove(bookmarkDiv.dataset.bookmarkId)
              bookmarkDiv.remove()
              const itemExists = document.querySelector('.item')
              if (!itemExists) {
                select5AndDisplay()
              }
              break
            case 'Open':
              browser.tabs.create({
                url: bookmarkDiv.dataset.bookmarkUrl,
                // Chrome will auto close the popup if active is true
                active: isFirefox ? true : false
              })
              break
          }
        }
      }
    })

    if (isFirefox) {
      // create some *DOM mutations* to force firefox resize popup window
      // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/user_interface/Popups#Popup_resizing
      const wastediv = document.createElement('div')
      document.addEventListener('mouseout', e => {
        popupList.appendChild(wastediv)
      })
    }
  }

  function select5AndDisplay () {
    while (popupList.firstChild) {
      popupList.removeChild(popupList.firstChild)
    }
    if (bookmarks.length < 5) {
      const newP = document.createElement('p')
      newP.className = 'error'
      newP.textContent =
        'Please consider deleting bookmarks after you get more than 5 of them!'
      popupList.appendChild(newP)
    } else {
      for (let i = 0; i < 5; i++) {
        const the_chosen_one = Math.floor(Math.random() * bookmarks.length)
        const itemDiv = document.createElement('div')
        itemDiv.className = 'item'
        itemDiv.textContent = bookmarks[the_chosen_one].title
        itemDiv.setAttribute('title', bookmarks[the_chosen_one].title)
        // button id=0Open -> div id=0bookmark
        itemDiv.setAttribute('id', i + 'bookmark')
        // html5 data attributes
        itemDiv.setAttribute('data-bookmark-id', bookmarks[the_chosen_one].id)
        itemDiv.setAttribute('data-bookmark-url', bookmarks[the_chosen_one].url)
        popupList.appendChild(itemDiv)

        const hiddenDiv = document.createElement('div')
        hiddenDiv.className = 'hidden'
        itemDiv.appendChild(hiddenDiv)
        const urlP = document.createElement('p')
        urlP.textContent = bookmarks[the_chosen_one].url
        urlP.setAttribute('title', bookmarks[the_chosen_one].url)
        hiddenDiv.appendChild(urlP)
        ;['Open', 'Delete'].forEach(action => {
          const newButton = document.createElement('button')
          newButton.textContent = action
          newButton.setAttribute('id', i + action)
          if ('Open' == action)
            newButton.setAttribute('title', bookmarks[the_chosen_one].url)
          hiddenDiv.appendChild(newButton)
        })

        bookmarks.splice(the_chosen_one, 1)
      }
    }
  }

  function onFulfilled (bookmarkItems) {
    bookmarks = bookmarkItems.filter(
      item => item.url != undefined && !item.url.startsWith('place:')
      //       ↑ chrome has no item.type   ↑ place:sort=8&maxResults=10 is Most Visited
    )
    select5AndDisplay()
    listenEvents()
  }

  function onRejected (error) {
    console.log(`An error: ${error}`)
  }

  var searching = browser.bookmarks.search({})
  searching.then(onFulfilled, onRejected)
})
