import { Alchemy, Network } from "alchemy-sdk";
import { useEffect, useState } from "react";

import "./App.css";

// Refer to the README doc for more information about using API
// keys in client-side code. You should never do this in production
// level code.
const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

// In this week's lessons we used ethers.js. Here we are using the
// Alchemy SDK is an umbrella library with several different packages.
//
// You can read more about the packages here:
//   https://docs.alchemy.com/reference/alchemy-sdk-api-surface-overview#api-surface
const alchemy = new Alchemy(settings);

function App() {
  const [blockNumber, setBlockNumber] = useState();
  const [blocks, setBlocks] = useState([]);
  const [blockWithTransactions, setBlockWithTransactions] = useState([]);
  const [isPopoverVisible, setIsPopoverVisible] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState();
  const [blockDetails, setBlockDetails] = useState(null);

  const togglePopover = (block) => {
    setIsPopoverVisible(!isPopoverVisible);
    setSelectedBlock(block);
  };

  useEffect(() => {
    async function getBlockNumber() {
      const currentBlockNumber = await alchemy.core.getBlockNumber();
      setBlockNumber(currentBlockNumber);

      const blockNumbers = Array.from(
        { length: 10 },
        (_, i) => currentBlockNumber - i - 1
      );
      setBlocks(blockNumbers);

      const blockWithTransactions = await alchemy.core.getBlockWithTransactions(
        currentBlockNumber
      );
      setBlockWithTransactions(blockWithTransactions);
    }

    getBlockNumber();
  }, []);

  useEffect(() => {
    async function fetchBlockDetails() {
      if (selectedBlock !== null) {
        const details = await alchemy.core.getBlock(selectedBlock);
        setBlockDetails(details);
        console.log(details.transactions);
      }
    }

    fetchBlockDetails();
  }, [selectedBlock]);

  return (
    <div className="bottom-section">
      <div className="bottom-item">
        <h2>Latest Blocks</h2>
        <div className="block-content">
          <h4>Current block: {blockNumber}</h4>
          {blocks.map((block) => (
            <div key={block} className="block">
              <p>
                Block Number:{" "}
                <button
                  onClick={() => togglePopover(block)}
                  className="popover-button"
                >
                  {block}
                </button>
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="bottom-item">
        <h2>Latest Transactions</h2>
        <div className="transaction-content">
          <h4>Content for transactions</h4>
          {blockWithTransactions.transactions &&
            blockWithTransactions.transactions.map((transaction) => (
              <div key={transaction.hash} className="transaction">
                <p>Transaction Hash: {transaction.hash}</p>
              </div>
            ))}
        </div>
      </div>
      {isPopoverVisible && (
        <div className="dialog-overlay">
          <div className="dialog">
            <h3>Block Details</h3>
            {blockDetails ? (
              <div>
                <p>Block Number: {blockDetails.number}</p>
                <p>
                  Timestamp:{" "}
                  {new Date(blockDetails.timestamp * 1000).toString()}
                </p>
                <p>Transactions: {blockDetails.transactions.length}</p>
                {blockDetails.transactions.slice(0, 10).map((transaction) => (
                  <div key={transaction} className="transaction">
                    <p>Transaction Hash: {transaction}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>Loading...</p>
            )}
            <button
              onClick={() => togglePopover(null)}
              className="close-button"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
