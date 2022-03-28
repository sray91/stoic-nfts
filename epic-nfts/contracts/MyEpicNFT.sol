// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

// We need some util functions for strings.
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

// We need to import the helper functions from the contract that we copy/pasted.
import { Base64 } from "./libraries/Base64.sol";

// We inherit the contract we imported. This means we'll have access
// to the inherited contract's methods.
contract MyEpicNFT is ERC721URIStorage {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  // This is our SVG code. All we need to change is the word that's displayed. Everything else stays the same.
  // So, we make a baseSvg variable here that all our NFTs can use.
  // We split the SVG at the part where it asks for the background color.

  string svgPartOne = "<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 350 350'><style>.base { fill: white; font-family: Helvetica, sans-serif; font-size: 45px; font-weight: 1000 }</style><rect width='100%' height='100%' fill='";
  string svgPartTwo = "'/><text y='50%' class='base' text-anchor='middle'><tspan x='50%'>";
  string svgPartThree = "</tspan><tspan x='50%' dy='12%'>";
  string svgPartFour = "</tspan><tspan x='50%' dy='12%'>";
  string svgEndString = "</tspan></text></svg>";

  string[] firstWords = ["Brave", "Kind", "Fair", "Modest", "Wise", "Strong"];
  string[] secondWords = ["Empathetic", "Resilient", "Cunning", "Humble", "Optimistic"];
  string[] thirdWords = ["Stoic", "Servant", "Student", "Leader", "Philosopher"];

  // Get fancy with it! Declare a bunch of colors.
  string[] colors = ["#264653", "#2A9D8F", "#E9C46A", "#F4A261", "#E76F51", "#000000"];

  uint256 maxNumberNFTs = 55;

  // event for assigning a token id
  event NewEpicNFTMinted(address sender, uint256 tokenId);

  constructor() ERC721 ("StoicNFT", "SQUARE") {
    console.log("This is my NFT contract. Woah!");
  }

  // I create a function to randomly pick a word from each array.
  function pickRandomFirstWord(uint256 tokenId) public view returns (string memory) {
    // I seed the random generator. More on this in the lesson. 
    uint256 rand = random(string(abi.encodePacked("FIRST_WORD", Strings.toString(tokenId))));
     // Squash the # between 0 and the length of the array to avoid going out of bounds.
    rand = rand % firstWords.length;
    return firstWords[rand];
  }

  function pickRandomSecondWord(uint256 tokenId) public view returns (string memory) {
    uint256 rand = random(string(abi.encodePacked("SECOND_WORD", Strings.toString(tokenId))));
    rand = rand % secondWords.length;
    return secondWords[rand];
  }

  function pickRandomThirdWord(uint256 tokenId) public view returns (string memory) {
    uint256 rand = random(string(abi.encodePacked("THIRD_WORD", Strings.toString(tokenId))));
    rand = rand % thirdWords.length;
    return thirdWords[rand];
  }

  // Same old stuff, pick a random color.
  function pickRandomColor(uint256 tokenId) public view returns (string memory) {
    uint256 rand = random(string(abi.encodePacked("COLOR", Strings.toString(tokenId))));
    rand = rand % colors.length;
    return colors[rand];
  }

  function random(string memory input) internal pure returns (uint256) {
    return uint256(keccak256(abi.encodePacked(input)));
  }

  function makeAnEpicNFT() public {
    uint256 newItemId = _tokenIds.current();
    // We go and randomly grab one word from each of the three arrays.
    string memory first = pickRandomFirstWord(newItemId);
    string memory second = pickRandomSecondWord(newItemId);
    string memory third = pickRandomThirdWord(newItemId);
    // Add the random color in.
    string memory randomColor = pickRandomColor(newItemId);
    // I concatenate it all together, and then close the <text> and <svg> tags.
    string memory finalSvg = string(abi.encodePacked(svgPartOne, randomColor, svgPartTwo, first, svgPartThree, second, svgPartFour, third, svgEndString));
    // Get all the JSON metadata in place and base64 encode it.
    string memory json = Base64.encode(
        bytes(
            string(
                abi.encodePacked(
                    '{"name": "',
                    combinedWord,
                    '", "description": "A highly acclaimed collection of stoic traits.", "image": "data:image/svg+xml;base64,',
                    Base64.encode(bytes(finalSvg)),
                    '"}'
                )
            )
        )
    );

    // Just like before, we prepend data:application/json;base64, to our data.
    string memory finalTokenUri = string(
        abi.encodePacked("data:application/json;base64,", json)
    );

    console.log("\n--------------------");
    console.log(finalTokenUri);
    console.log("--------------------\n");

    // require statement to limit the number of NFTs minted
    require(newItemId < maxNumberNFTs, "Max number of NFTs have been minted.");

    // Set the NFTs data.
    // Actually mint the NFT to the sender using msg.sender.
    _safeMint(msg.sender, newItemId);
  
    _setTokenURI(newItemId, finalTokenUri);
    
    // Increment the counter for when the next NFT is minted.
    _tokenIds.increment();
    console.log("An NFT w/ ID %s has been minted to %s", newItemId, msg.sender);
    emit NewEpicNFTMinted(msg.sender, newItemId);
  }

  function getTotalNFTsMintedSoFar() public view returns (uint256) {
        return _tokenIds.current();
  }
}
