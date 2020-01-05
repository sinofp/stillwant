/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
document.addEventListener('DOMContentLoaded', function () {
  const popupList = document.getElementById('popup-content')
  let bookmarks = []
  let displayDict = {}

  function listenEvents () {
    document.addEventListener('click', e => {
      if (e.target.nodeName === 'BUTTON') {
        // BUTTON -> DIV hidden -> DIV item
        const bookmarkTitle =
          e.target.parentNode.parentNode.firstChild.nodeValue
        console.log(bookmarkTitle)
        console.log(e.target.textContent)
        switch (e.target.textContent) {
          case 'Delete':
            browser.bookmarks.remove(displayDict[bookmarkTitle].id)
            e.target.parentNode.parentElement.remove()
            const itemExists = document.querySelector('.item')
            if (!itemExists) {
              select5AndDisplay()
            }
            break
          case 'Open':
            browser.tabs.create({ url: displayDict[bookmarkTitle].url })
            break
          case 'Refresh':
            select5AndDisplay()
            break
        }
      }
    })

    // create some *DOM mutations* to force firefox resize popup window
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/user_interface/Popups#Popup_resizing
    const wastediv = document.createElement('div')
    document.addEventListener('mouseout', e => {
      console.log(`mouseout: ${e.target.nodeName}`)
      popupList.appendChild(wastediv)
    })
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
        displayDict[itemDiv.textContent] = {
          id: bookmarks[the_chosen_one].id,
          url: bookmarks[the_chosen_one].url
        }
        popupList.appendChild(itemDiv)

        const hiddenDiv = document.createElement('div')
        hiddenDiv.className = 'hidden'
        itemDiv.appendChild(hiddenDiv)
        const urlP = document.createElement('p')
        urlP.textContent = bookmarks[the_chosen_one].url
        hiddenDiv.appendChild(urlP)
        ;['Open', 'Delete'].forEach(function (action) {
          const newButton = document.createElement('button')
          newButton.textContent = action
          hiddenDiv.appendChild(newButton)
        })

        bookmarks.splice(the_chosen_one, 1)
      }
    }
  }

  function onFulfilled (bookmarkItems) {
    bookmarks = bookmarkItems.filter(
      item => item.type === 'bookmark' && !item.url.startsWith('place:') // place:sort=8&maxResults=10 is Most Visited
    )
    // truncate super long title
    bookmarkItems.forEach(bookmark => {
      if (bookmark.title.length > 100)
        bookmark.title = bookmark.title.substr(0, 100) + '…'
    })
    select5AndDisplay()
    listenEvents()
  }

  function onRejected (error) {
    console.log(`An error: ${error}`)
  }

  var searching = browser.bookmarks.search({})
  searching.then(onFulfilled, onRejected)
})
